import type { CanvasDocument } from "./document";
import {
  elementBounds,
  zOrderKey,
  type CanvasElement,
  type ElementKind,
  type ElementKinds,
} from "./elements";
import {
  intersectRects,
  rectContainsRect,
  rectsEqual,
  rectsIntersect,
  unionRects,
} from "./geometry";
import type { Point, Rect } from "./geometry.types";
import type { ResizeMode } from "./handles";
import { pointInRotatedRect, toUnrotated } from "./rotation";
import {
  buildOverlayState,
  clipBounds,
  homeOf,
  NO_EFFECTS,
  NO_MASKS,
  sameSlot,
  scopeHome,
  type ElementClip,
  type ElementEffects,
  type ElementMask,
  type ElementMasks,
  type OverlayState,
  type ScopeSlot,
} from "./render";
import type { SceneHooks } from "./scene.types";
import { Selection } from "./selection";
import { deepEqual } from "./utils";

/**
 * What's on the canvas right now and what the user is pointing at: the z-ordered element list,
 * the selection, hover and marquee. Answers spatial queries for tools and the renderer.
 */
export class Scene {
  readonly selection = new Selection();
  private list: CanvasElement[] = [];
  private byId = new Map<string, CanvasElement>();
  private derived: string[] = [];
  private keys = new Map<string, string>();
  private clips = new Map<string, ElementClip>();
  private maskData: ElementMasks = NO_MASKS;
  private effectData: ElementEffects = NO_EFFECTS;
  private undrawnIds: ReadonlySet<string> = new Set();
  private replaced: string[] = [];
  private scopes = new Map<string, string | null>();
  private hoverId: string | null = null;
  marquee: Rect | null = null;
  /** What the selection's handles do, set from the active tool (the Scale tool's `scale`). */
  resizeMode: ResizeMode = "resize";
  /** The scope shown (see `SceneHooks.scopeOf`); `refresh` reads it. */
  scope: string | null = null;
  /**
   * While set, only the elements it accepts can be pointed at, selected or marqueed; the rest are
   * shown dimmed (the current mode's, `CanvasMode.isolate`).
   */
  isolation: ((el: CanvasElement) => boolean) | null = null;

  constructor(
    private readonly doc: CanvasDocument,
    readonly kinds: ElementKinds,
    private readonly hooks: SceneHooks = {},
  ) {}

  /** Elements sorted bottom-to-top. */
  get elements(): readonly CanvasElement[] {
    return this.list;
  }

  /**
   * Re-reads the element list from the document, with derived geometry resolved, in drawing
   * order. Read elements here, not from the document, when their geometry matters.
   */
  refresh(): void {
    const all = this.doc.all();
    const { scopeOf } = this.hooks;
    this.scopes = scopeOf ? new Map(all.map((el) => [el.id, scopeOf(el)])) : new Map();
    const raw = scopeOf ? all.filter((el) => this.scopes.get(el.id) === this.scope) : all;
    const previous = this.byId;
    const resolved = this.hooks.resolve ? this.keepResolved(raw, this.hooks.resolve(raw)) : raw;
    this.derived = resolved
      .filter((el, i) => el !== raw[i] && previous.get(el.id) !== el)
      .map((el) => el.id);
    const custom = this.hooks.orderKeys?.(resolved);
    const keys = new Map(
      resolved.map((el) => [el.id, custom?.get(el.id) ?? zOrderKey(el, this.kinds.kindOf(el))]),
    );
    const clips = this.hooks.clips?.(resolved) ?? new Map<string, ElementClip>();
    // Without these hooks, a key only changes with its own element, which is redrawn anyway.
    const replaced = new Set<string>();
    if (custom) for (const [id, key] of keys) if (this.keys.get(id) !== key) replaced.add(id);
    for (const id of new Set([...clips.keys(), ...this.clips.keys()])) {
      if (!sameClip(clips.get(id), this.clips.get(id))) replaced.add(id);
    }
    const masks = this.hooks.masks?.(resolved) ?? NO_MASKS;
    const effects = this.hooks.effects?.(resolved) ?? NO_EFFECTS;
    const homed = new Set([
      ...masks.homes.keys(),
      ...this.maskData.homes.keys(),
      ...effects.homes.keys(),
      ...this.effectData.homes.keys(),
    ]);
    for (const id of homed) {
      const now = homeOf(id, masks, effects);
      if (!sameSlot(now, homeOf(id, this.maskData, this.effectData))) replaced.add(id);
    }
    // An element that gains or loses effects is placed again (its view moves into its scope).
    for (const id of effects.scopes.keys()) if (!this.effectData.scopes.has(id)) replaced.add(id);
    for (const id of this.effectData.scopes.keys()) if (!effects.scopes.has(id)) replaced.add(id);
    const undrawn = this.hooks.undrawn?.(resolved) ?? new Set<string>();
    for (const id of undrawn) if (!this.undrawnIds.has(id)) replaced.add(id);
    for (const id of this.undrawnIds) if (!undrawn.has(id)) replaced.add(id);
    this.undrawnIds = undrawn;
    this.replaced = [...replaced];
    this.keys = keys;
    this.clips = clips;
    this.maskData = masks;
    this.effectData = effects;
    this.list = resolved.sort((a, b) => {
      const ka = keys.get(a.id)!;
      const kb = keys.get(b.id)!;
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
    this.byId = new Map(this.list.map((el) => [el.id, el]));
  }

  /**
   * `resolved` with each derived element that resolved as it did last time replaced by last
   * time's object, so only what really changed counts as changed (and is drawn again).
   */
  private keepResolved(raw: CanvasElement[], resolved: CanvasElement[]): CanvasElement[] {
    let derived = 0;
    const kept = resolved.map((el, i) => {
      if (el === raw[i]) return el;
      derived++;
      const before = this.byId.get(el.id);
      if (!before || before === raw[i]) return el;
      const kind = this.kinds.kindOf(el);
      const same =
        kind === this.kinds.kindOf(before) &&
        kind.drawnFrom(el) === kind.drawnFrom(before) &&
        deepEqual(el, before);
      return same ? before : el;
    });
    return derived > 0 ? kept : resolved;
  }

  /**
   * The scope of every element in the document at the last refresh (empty without scopes), so
   * elements outside the scene, and ones just removed, can be placed.
   */
  get scopeIds(): ReadonlyMap<string, string | null> {
    return this.scopes;
  }

  /**
   * Ids of elements whose geometry the product derives from others (see `resolveElements`) and
   * that resolved differently in the last refresh.
   */
  get derivedIds(): readonly string[] {
    return this.derived;
  }

  /**
   * Ids whose drawing order or clip changed in the last refresh although the element itself may
   * not have (e.g. a node whose frame moved in the order, or was resized), so their views are
   * placed again.
   */
  get replacedIds(): readonly string[] {
    return this.replaced;
  }

  /** What clips an element (the product's `clips`), or `null`. */
  clipOf(el: CanvasElement): ElementClip | null {
    return this.clips.get(el.id) ?? null;
  }

  /** Whether an element is drawn on its own (see `CanvasProduct.undrawn`). */
  drawn(el: CanvasElement): boolean {
    return !this.undrawnIds.has(el.id);
  }

  /** The masks on the canvas (the product's `masks`), and where each masked element is drawn. */
  get masks(): ElementMasks {
    return this.maskData;
  }

  /** The effect scopes on the canvas (the product's `effects`), and what each is drawn over. */
  get effects(): ElementEffects {
    return this.effectData;
  }

  /** The masks an element shows through, innermost first (the ones it's part of left out). */
  masksOf(el: CanvasElement): ElementMask[] {
    const masks: ElementMask[] = [];
    const limit = this.maskData.masks.size + this.effectData.scopes.size;
    let slot: ScopeSlot | null = homeOf(el.id, this.maskData, this.effectData);
    for (let depth = 0; slot && depth <= limit; depth++) {
      if ("mask" in slot) {
        const mask = this.maskData.masks.get(slot.mask);
        if (!mask) break;
        if (slot.role === "masked") masks.push(mask);
      }
      slot = scopeHome(slot, this.maskData, this.effectData);
    }
    return masks;
  }

  /**
   * Where an element and its own effects show (exports, previews): `shownBounds` grown by how far
   * its effects reach (a drop shadow, a blur).
   */
  visualBounds(el: CanvasElement): Rect {
    const shown = this.shownBounds(el);
    const scope = this.effectData.scopes.get(el.id);
    const reach = scope && this.hooks.effectsOutset ? this.hooks.effectsOutset(scope.effects) : 0;
    if (reach <= 0 || (shown.w === 0 && shown.h === 0)) return shown;
    return {
      x: shown.x - reach,
      y: shown.y - reach,
      w: shown.w + reach * 2,
      h: shown.h + reach * 2,
    };
  }

  /**
   * Where an element shows: its bounds narrowed to its clip and to the masks it shows through
   * (an inverted mask doesn't narrow it). Empty (0×0) when nothing of it shows.
   */
  shownBounds(el: CanvasElement): Rect {
    let rect = elementBounds(this.kinds.kindOf(el), el);
    const clip = this.clips.get(el.id);
    if (clip) rect = intersectRects(rect, clipBounds(clip));
    for (const mask of this.masksOf(el))
      if (!mask.inverted) rect = intersectRects(rect, mask.bounds);
    return rect;
  }

  /** An element's drawing order key (elements not in the scene, like drafts, get `zOrderKey`). */
  orderKey(el: CanvasElement, kind: ElementKind): string {
    return this.keys.get(el.id) ?? zOrderKey(el, kind);
  }

  get(id: string): CanvasElement | undefined {
    return this.byId.get(id);
  }

  /** Whether the element can be pointed at and selected: inside the isolation and, unless asked, unlocked. */
  reachable(el: CanvasElement, includeLocked = false): boolean {
    if (this.isolation && !this.isolation(el)) return false;
    return includeLocked || !el.locked;
  }

  /**
   * Topmost element at a world point. `tolerance` is in world units. Locked elements are skipped
   * unless `includeLocked` is set; isolated-away ones always are.
   */
  elementAt(world: Point, tolerance: number, includeLocked = false): CanvasElement | undefined {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const el = this.list[i]!;
      if (!this.reachable(el, includeLocked)) continue;
      // What's clipped away can't be clicked.
      const clip = this.clips.get(el.id);
      if (clip && !pointInRotatedRect(world, clip.rect, clip.rotation ?? 0, tolerance)) continue;
      // Nor can what a mask hides.
      if (this.masksOf(el).some((mask) => mask.contains(world) === mask.inverted)) continue;
      // Kinds hit-test unturned: the point goes into the element's unturned frame.
      if (this.kinds.kindOf(el).hitTest(el, toUnrotated(world, el), tolerance)) return el;
    }
    return undefined;
  }

  /**
   * Unlocked elements touching the rect where they show (clipped and masked). Frames only count
   * when the rect encloses them.
   */
  elementsInRect(rect: Rect): CanvasElement[] {
    return this.list.filter((el) => {
      if (!this.reachable(el)) return false;
      const kind = this.kinds.kindOf(el);
      const bounds = elementBounds(kind, el);
      if (kind.frame) return rectContainsRect(rect, bounds);
      const shown = this.shownBounds(el);
      // Clipped or masked away entirely (a line's bounds may be flat, but not a point).
      if (shown.w === 0 && shown.h === 0 && (bounds.w > 0 || bounds.h > 0)) return false;
      return rectsIntersect(shown, rect);
    });
  }

  /** Bounding box of all elements, or `null` for an empty canvas. */
  contentBounds(): Rect | null {
    return unionRects(this.list.map((el) => elementBounds(this.kinds.kindOf(el), el)));
  }

  /** The kind of an element on the canvas. */
  kindOf<E extends CanvasElement>(el: E): ElementKind<E> {
    return this.kinds.kindOf(el);
  }

  get hoveredId(): string | null {
    return this.hoverId;
  }

  /** Returns whether the hover target changed. */
  setHover(id: string | null): boolean {
    if (this.hoverId === id) return false;
    this.hoverId = id;
    return true;
  }

  /**
   * The masks the hovered element (or else the single selected one) shows through, and the
   * element itself when it's a mask, so the overlay outlines what's masking it.
   */
  private outlinedMasks(): CanvasElement[] {
    if (this.maskData.masks.size === 0) return [];
    const [only] = this.selection.ids;
    const id = this.hoverId ?? (this.selection.ids.size === 1 ? only : undefined);
    const el = id ? this.byId.get(id) : undefined;
    if (!el) return [];
    const ids = this.masksOf(el).map((mask) => mask.id);
    if (this.maskData.masks.has(el.id)) ids.push(el.id);
    return ids.map((maskId) => this.byId.get(maskId)).filter((mask) => mask !== undefined);
  }

  overlay(zoom: number): OverlayState {
    return buildOverlayState({
      kinds: this.kinds,
      selected: this.list.filter((el) => this.selection.has(el.id)),
      part: this.selection.part,
      hover: this.hoverId ? this.byId.get(this.hoverId) : undefined,
      masks: this.outlinedMasks(),
      marquee: this.marquee,
      zoom,
      resizeMode: this.resizeMode,
    });
  }
}

function sameClip(a: ElementClip | undefined, b: ElementClip | undefined): boolean {
  if (!a || !b) return a === b;
  return (
    a.radius === b.radius && (a.rotation ?? 0) === (b.rotation ?? 0) && rectsEqual(a.rect, b.rect)
  );
}
