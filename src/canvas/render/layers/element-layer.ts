import { Container } from "pixi.js";

import type { CanvasElement, ElementKinds } from "../../elements";
import type { Rect } from "../../geometry.types";
import type { HiddenText } from "../element-view.types";
import { ElementView } from "../element-view";
import { entranceAt } from "../entrance";
import type { ImageCache } from "../image-cache";
import { DEFAULT_PLACEMENT, NO_MASKS } from "../layer-placement";
import type { ElementMasks, LayerPlacement, MaskSlot } from "../layer-placement.types";
import { textResolution } from "../text-resolution";
import { insertOrdered } from "./insert-ordered";
import { MaskScopeView } from "./mask-scope-view";
import { MaskSource } from "./mask-source";

/**
 * Keeps one ElementView per element, in drawing order, clipped and masked (see `LayerPlacement`).
 * Views under a mask sit in its `MaskScopeView`, nested as the masks are; the others sit here.
 */
export class ElementLayer extends Container {
  private readonly views = new Map<string, ElementView>();
  /** Mask id → its scope, for the masks whose element this layer draws. */
  private readonly scopes = new Map<string, MaskScopeView>();
  private masks: ElementMasks = NO_MASKS;
  private hiddenText: HiddenText | null = null;
  private faded = new Set<string>();
  private textResolution = 1;
  /** Elements playing their entrance, with when it started. */
  private readonly entrances = new Map<string, number>();

  constructor(
    private readonly kinds: ElementKinds,
    private readonly images: ImageCache,
    private readonly placement: LayerPlacement = DEFAULT_PLACEMENT,
  ) {
    super();
  }

  /** Creates or updates views for `elements` and destroys the views for `removed` ids. */
  sync(elements: Iterable<CanvasElement>, removed: Iterable<string> = []): void {
    for (const id of removed) {
      this.views.get(id)?.destroy({ children: true });
      this.views.delete(id);
      this.entrances.delete(id);
    }
    /** Views that are new or moved in the drawing order. */
    const moved = new Set<ElementView>();
    const synced: ElementView[] = [];
    for (const el of elements) {
      let view = this.views.get(el.id);
      const kind = this.kinds.kindOf(el);
      if (view) {
        const order = view.order;
        view.sync(el, kind, this.placement.orderOf(el, kind));
        if (view.order !== order) moved.add(view);
      } else {
        view = this.create(el);
        moved.add(view);
      }
      view.setClip(this.placement.clipOf(el));
      view.setDrawn(this.placement.drawn(el));
      synced.push(view);
    }
    const rehome = this.syncMasks();
    for (const view of rehome ? this.views.values() : synced) this.place(view, moved.has(view));
  }

  /** Destroys the views of elements not in `ids` (e.g. removed while the views were built). */
  retain(ids: ReadonlySet<string>): void {
    let removed = false;
    for (const [id, view] of this.views) {
      if (ids.has(id)) continue;
      view.destroy({ children: true });
      this.views.delete(id);
      this.entrances.delete(id);
      removed = true;
    }
    if (removed && this.syncMasks()) for (const view of this.views.values()) this.place(view);
  }

  /**
   * Skips drawing the views outside `visible` (a world rect): large documents draw only what shows.
   * What makes up a mask is always drawn (into its mask), unless the whole mask is off screen.
   */
  cull(visible: Rect): void {
    for (const scope of this.scopes.values()) scope.cull(visible);
    for (const view of this.views.values()) {
      if (inMaskSource(view, this)) {
        if (view.culled) view.culled = false;
      } else {
        view.cull(visible);
      }
    }
  }

  /** Starts the entrance of these elements (those this layer doesn't draw are ignored). */
  animateIn(ids: Iterable<string>, now: number): void {
    for (const id of ids) {
      const view = this.views.get(id);
      if (!view) continue;
      this.entrances.set(id, now);
      view.setEntrance(0, 0);
    }
  }

  /** Advances the entrances to `now`. Returns whether some are still playing. */
  tick(now: number): boolean {
    for (const [id, start] of this.entrances) {
      const view = this.views.get(id);
      const look = view ? entranceAt(now - start) : null;
      if (look) {
        view?.setEntrance(look.scale, look.alpha);
        continue;
      }
      view?.setEntrance(1, 1);
      this.entrances.delete(id);
    }
    return this.entrances.size > 0;
  }

  /** Dims these elements (those this layer doesn't draw are ignored); an empty list clears it. */
  setFaded(ids: Iterable<string>): void {
    const next = new Set(ids);
    for (const id of this.faded) if (!next.has(id)) this.views.get(id)?.setFaded(false);
    for (const id of next) this.views.get(id)?.setFaded(true);
    this.faded = next;
  }

  /** Hides an element's canvas text (or one part of it) while the DOM text editor is showing it. */
  setHiddenText(hidden: HiddenText | null): void {
    if (this.hiddenText) this.showText(this.views.get(this.hiddenText.id), null);
    this.hiddenText = hidden;
    if (hidden) this.showText(this.views.get(hidden.id), hidden);
  }

  /** Lays out again the texts of these elements (those this layer doesn't draw are ignored). */
  refreshText(ids: Iterable<string>): void {
    for (const id of ids) this.views.get(id)?.refreshText();
  }

  /** Re-rasterizes text for the current zoom so it stays crisp. */
  setTextZoom(zoom: number): void {
    const resolution = textResolution(zoom);
    if (resolution === this.textResolution) return;
    this.textResolution = resolution;
    for (const view of this.views.values()) view.setTextResolution(resolution);
  }

  override destroy(): void {
    this.views.clear();
    this.scopes.clear();
    super.destroy({ children: true });
  }

  private create(el: CanvasElement): ElementView {
    const kind = this.kinds.kindOf(el);
    const view = new ElementView(el, kind, this.images, this.placement.orderOf(el, kind));
    view.setTextResolution(this.textResolution);
    if (this.hiddenText?.id === el.id) this.showText(view, this.hiddenText);
    if (this.faded.has(el.id)) view.setFaded(true);
    this.views.set(el.id, view);
    return view;
  }

  /**
   * Brings the scopes in line with the placement's masks: one for each mask whose element this
   * layer draws, nested and stacked where the mask is, masking as it says. Returns whether a
   * scope was added or removed, so every view has to be placed again.
   */
  private syncMasks(): boolean {
    this.masks = this.placement.masks();
    if (this.masks.masks.size === 0 && this.scopes.size === 0) return false;
    let changed = false;
    const reordered = new Set<MaskScopeView>();
    for (const [id, scope] of this.scopes) {
      if (this.masks.masks.has(id) && this.views.has(id)) continue;
      // Its views are placed again by the caller; nested scopes below.
      for (const child of [...scope.children, ...scope.source.children]) {
        if (child instanceof ElementView || child instanceof MaskScopeView)
          child.removeFromParent();
      }
      scope.destroy({ children: true });
      this.scopes.delete(id);
      changed = true;
    }
    for (const [id, mask] of this.masks.masks) {
      const view = this.views.get(id);
      if (!view) continue;
      let scope = this.scopes.get(id);
      if (!scope) {
        scope = new MaskScopeView(id);
        this.scopes.set(id, scope);
        reordered.add(scope);
        changed = true;
      }
      if (scope.order !== view.order) {
        scope.order = view.order;
        reordered.add(scope);
      }
      scope.apply(mask);
    }
    for (const [id, scope] of this.scopes) {
      const home = this.containerOf(this.masks.masks.get(id)?.home ?? null);
      if (reordered.has(scope) || scope.parent !== home) insertOrdered(home, scope);
    }
    return changed;
  }

  /** The container a slot's views go in: the mask's scope or source, else the slot round it. */
  private containerOf(slot: MaskSlot | null): Container {
    for (let depth = 0; slot && depth <= this.scopes.size + 1; depth++) {
      const scope = this.scopes.get(slot.mask);
      if (scope) return slot.role === "source" ? scope.source : scope;
      // This layer doesn't draw the mask (e.g. a snapshot of what it masks only).
      slot = this.masks.masks.get(slot.mask)?.home ?? null;
    }
    return this;
  }

  /** Shows all of a view's text except what `hidden` names (all of it when it has no part). */
  private showText(view: ElementView | undefined, hidden: HiddenText | null): void {
    view?.setTextVisible(!hidden || hidden.part !== null);
    view?.setHiddenSlot(hidden?.part ?? null);
  }

  /**
   * Puts the view in the container of its mask slot, at its z-order position, when it isn't
   * there yet or `moved` in the order.
   */
  private place(view: ElementView, moved = false): void {
    const container = this.containerOf(this.masks.homes.get(view.elementId) ?? null);
    if (moved || view.parent !== container) insertOrdered(container, view);
  }
}

/** Whether the view is drawn as part of a mask (in a mask's source, at any depth). */
function inMaskSource(view: ElementView, layer: ElementLayer): boolean {
  for (let parent = view.parent; parent && parent !== layer; parent = parent.parent) {
    if (parent instanceof MaskSource) return true;
  }
  return false;
}
