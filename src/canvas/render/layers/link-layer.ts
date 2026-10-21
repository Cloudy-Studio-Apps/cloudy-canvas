import { Graphics } from "pixi.js";

import type { CanvasLinks, LinkView } from "../../links";

/** The product's links, in world space under the elements so elements cover their ends. */
export class LinkLayer extends Graphics {
  constructor(private readonly links: readonly CanvasLinks[]) {
    super();
  }

  draw(view: LinkView): void {
    this.clear();
    for (const links of this.links) links.draw(this, view);
  }
}
