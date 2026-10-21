import { Container } from "pixi.js";

import type { Shape } from "../../document";
import { ShapeView } from "../shapes/shape-view";

const MAX_TEXT_RESOLUTION = 8;

/** Keeps one ShapeView per shape, ordered by fractional index (z-order). */
export class ShapeLayer extends Container<ShapeView> {
  private readonly views = new Map<string, ShapeView>();
  private hiddenTextId: string | null = null;
  private textResolution = 1;

  /** Creates or updates views for `shapes` and destroys the views for `removed` ids. */
  sync(shapes: Iterable<Shape>, removed: Iterable<string> = []): void {
    for (const id of removed) {
      this.views.get(id)?.destroy({ children: true });
      this.views.delete(id);
    }
    for (const shape of shapes) {
      const view = this.views.get(shape.id);
      if (view) {
        const indexChanged = view.index !== shape.index;
        view.sync(shape);
        if (indexChanged) this.place(view);
      } else {
        this.add(shape);
      }
    }
  }

  /** Hides a shape's canvas text while the DOM text editor is showing it. */
  setHiddenText(id: string | null): void {
    if (this.hiddenTextId) this.views.get(this.hiddenTextId)?.setTextVisible(true);
    this.hiddenTextId = id;
    if (id) this.views.get(id)?.setTextVisible(false);
  }

  /** Re-rasterizes text for the current zoom so it stays crisp. */
  setTextZoom(zoom: number): void {
    const dpr = window.devicePixelRatio || 1;
    const resolution = Math.min(dpr * Math.max(1, Math.ceil(zoom * 2) / 2), MAX_TEXT_RESOLUTION);
    if (resolution === this.textResolution) return;
    this.textResolution = resolution;
    for (const view of this.views.values()) view.setTextResolution(resolution);
  }

  override destroy(): void {
    this.views.clear();
    super.destroy({ children: true });
  }

  private add(shape: Shape): void {
    const view = new ShapeView(shape);
    view.setTextResolution(this.textResolution);
    view.setTextVisible(shape.id !== this.hiddenTextId);
    this.views.set(shape.id, view);
    this.place(view);
  }

  /** Inserts the view at its z-order position (binary search over sorted children). */
  private place(view: ShapeView): void {
    if (view.parent === this) this.removeChild(view);
    let lo = 0;
    let hi = this.children.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.children[mid]!.index <= view.index) lo = mid + 1;
      else hi = mid;
    }
    this.addChildAt(view, lo);
  }
}
