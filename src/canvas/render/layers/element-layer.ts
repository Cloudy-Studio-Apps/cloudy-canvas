import { Container } from "pixi.js";

import type { CanvasElement, ElementKinds } from "../../elements";
import type { HiddenText } from "../element-view.types";
import { ElementView } from "../element-view";
import { entranceAt } from "../entrance";
import type { ImageCache } from "../image-cache";
import { DEFAULT_PLACEMENT } from "../layer-placement";
import type { LayerPlacement } from "../layer-placement.types";
import { textResolution } from "../text-resolution";

/** Keeps one ElementView per element, in drawing order and clipped (see `LayerPlacement`). */
export class ElementLayer extends Container<ElementView> {
  private readonly views = new Map<string, ElementView>();
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
    for (const el of elements) {
      const view = this.views.get(el.id);
      if (view) {
        const order = view.order;
        const kind = this.kinds.kindOf(el);
        view.sync(el, kind, this.placement.orderOf(el, kind));
        view.setClip(this.placement.clipOf(el));
        if (view.order !== order) this.place(view);
      } else {
        this.add(el);
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
    super.destroy({ children: true });
  }

  private add(el: CanvasElement): void {
    const kind = this.kinds.kindOf(el);
    const view = new ElementView(el, kind, this.images, this.placement.orderOf(el, kind));
    view.setClip(this.placement.clipOf(el));
    view.setTextResolution(this.textResolution);
    if (this.hiddenText?.id === el.id) this.showText(view, this.hiddenText);
    if (this.faded.has(el.id)) view.setFaded(true);
    this.views.set(el.id, view);
    this.place(view);
  }

  /** Shows all of a view's text except what `hidden` names (all of it when it has no part). */
  private showText(view: ElementView | undefined, hidden: HiddenText | null): void {
    view?.setTextVisible(!hidden || hidden.part !== null);
    view?.setHiddenSlot(hidden?.part ?? null);
  }

  /** Inserts the view at its z-order position (binary search over sorted children). */
  private place(view: ElementView): void {
    if (view.parent === this) this.removeChild(view);
    let lo = 0;
    let hi = this.children.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.children[mid]!.order <= view.order) lo = mid + 1;
      else hi = mid;
    }
    this.addChildAt(view, lo);
  }
}
