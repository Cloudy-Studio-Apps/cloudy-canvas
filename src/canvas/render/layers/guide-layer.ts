import { Graphics } from "pixi.js";

import type { Guide, GuideView } from "../../links";

/** A tool's gesture feedback, in world space above the elements. */
export class GuideLayer extends Graphics {
  private guide: Guide | null = null;

  set(guide: Guide | null): void {
    this.guide = guide;
  }

  draw(view: GuideView): void {
    this.clear();
    this.guide?.(this, view);
  }
}
