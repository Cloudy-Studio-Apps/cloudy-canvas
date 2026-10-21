import { Container } from "pixi.js";

import type { CanvasElement, ElementKinds } from "../../elements";
import { ElementView } from "../element-view";

/**
 * An element being created that isn't in the document yet (e.g. the stroke under the marker).
 * It's drawn by its kind like any element, so every type gets a live preview for free.
 */
export class DraftLayer extends Container {
  private view: ElementView | null = null;

  constructor(private readonly kinds: ElementKinds) {
    super();
  }

  show(el: CanvasElement | null): void {
    if (!el) {
      this.view?.destroy({ children: true });
      this.view = null;
      return;
    }
    const kind = this.kinds.kindOf(el);
    if (this.view) {
      this.view.sync(el, kind);
    } else {
      this.view = this.addChild(new ElementView(el, kind));
    }
  }
}
