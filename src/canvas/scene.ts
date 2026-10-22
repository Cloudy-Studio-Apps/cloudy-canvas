import type { CanvasDocument } from "./document";
import {
  elementBounds,
  zOrderKey,
  type CanvasElement,
  type ElementKind,
  type ElementKinds,
} from "./elements";
import { rectContainsRect, rectsEqual, rectsIntersect, unionRects } from "./geometry";
import type { Point, Rect } from "./geometry.types";
import type { ResizeMode } from "./handles";
import { pointInRotatedRect, toUnrotated } from "./rotation";
import { buildOverlayState, type ElementClip, type OverlayState } from "./render";
import type { SceneHooks } from "./scene.types";
import { Selection } from "./selection";

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
  private replaced: string[] = [];
  private scopes = new Map<string, string | null>();
  private hoverId: string | null = null;
  marquee: Rect | null = null;
  /** What the selection's handles do, set from the active tool (the Scale tool's `scale`). */
  resizeMode: ResizeMode = "resize";
  /** The scope shown (see `SceneHooks.scopeOf`); `refresh` reads it. */
  scope: string | null = null;

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
    const resolved = this.hooks.resolve ? this.hooks.resolve(raw) : raw;
    this.derived = resolved.filter((el, i) => el !== raw[i]).map((el) => el.id);
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
    this.replaced = [...replaced];
    this.keys = keys;
    this.clips = clips;
    this.list = resolved.sort((a, b) => {
      const ka = keys.get(a.id)!;
      const kb = keys.get(b.id)!;
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
    this.byId = new Map(this.list.map((el) => [el.id, el]));
  }

  /**
   * The scope of every element in the document at the last refresh (empty without scopes), so
   * elements outside the scene, and ones just removed, can be placed.
   */
  get scopeIds(): ReadonlyMap<string, string | null> {
    return this.scopes;
  }

  /** Ids of elements whose geometry the product derives from others (see `resolveElements`). */
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

  /** An element's drawing order key (elements not in the scene, like drafts, get `zOrderKey`). */
  orderKey(el: CanvasElement, kind: ElementKind): string {
    return this.keys.get(el.id) ?? zOrderKey(el, kind);
  }

  get(id: string): CanvasElement | undefined {
    return this.byId.get(id);
  }

  /**
   * Topmost element at a world point. `tolerance` is in world units. Locked elements are skipped
   * unless `includeLocked` is set.
   */
  elementAt(world: Point, tolerance: number, includeLocked = false): CanvasElement | undefined {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const el = this.list[i]!;
      if (el.locked && !includeLocked) continue;
      // What's clipped away can't be clicked.
      const clip = this.clips.get(el.id);
      if (clip && !pointInRotatedRect(world, clip.rect, clip.rotation ?? 0, tolerance)) continue;
      // Kinds hit-test unturned: the point goes into the element's unturned frame.
      if (this.kinds.kindOf(el).hitTest(el, toUnrotated(world, el), tolerance)) return el;
    }
    return undefined;
  }

  /** Unlocked elements touching the rect. Frames only count when the rect encloses them. */
  elementsInRect(rect: Rect): CanvasElement[] {
    return this.list.filter((el) => {
      if (el.locked) return false;
      const kind = this.kinds.kindOf(el);
      const bounds = elementBounds(kind, el);
      return kind.frame ? rectContainsRect(rect, bounds) : rectsIntersect(bounds, rect);
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

  overlay(zoom: number): OverlayState {
    return buildOverlayState({
      kinds: this.kinds,
      selected: this.list.filter((el) => this.selection.has(el.id)),
      part: this.selection.part,
      hover: this.hoverId ? this.byId.get(this.hoverId) : undefined,
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
