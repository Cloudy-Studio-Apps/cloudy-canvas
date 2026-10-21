import { Container } from "pixi.js";

import type { CanvasElement, ElementKinds } from "../../elements";
import { ElementView } from "../element-view";
import { textResolution } from "../text-resolution";

/** Keeps one ElementView per element, in drawing order (see `zOrderKey`). */
export class ElementLayer extends Container<ElementView> {
  private readonly views = new Map<string, ElementView>();
  private hiddenTextId: string | null = null;
  private textResolution = 1;

  constructor(private readonly kinds: ElementKinds) {
    super();
  }

  /** Creates or updates views for `elements` and destroys the views for `removed` ids. */
  sync(elements: Iterable<CanvasElement>, removed: Iterable<string> = []): void {
    for (const id of removed) {
      this.views.get(id)?.destroy({ children: true });
      this.views.delete(id);
    }
    for (const el of elements) {
      const view = this.views.get(el.id);
      if (view) {
        const order = view.order;
        view.sync(el, this.kinds.kindOf(el));
        if (view.order !== order) this.place(view);
      } else {
        this.add(el);
      }
    }
  }

  /** Hides an element's canvas text while the DOM text editor is showing it. */
  setHiddenText(id: string | null): void {
    if (this.hiddenTextId) this.views.get(this.hiddenTextId)?.setTextVisible(true);
    this.hiddenTextId = id;
    if (id) this.views.get(id)?.setTextVisible(false);
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
    const view = new ElementView(el, this.kinds.kindOf(el));
    view.setTextResolution(this.textResolution);
    view.setTextVisible(el.id !== this.hiddenTextId);
    this.views.set(el.id, view);
    this.place(view);
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
