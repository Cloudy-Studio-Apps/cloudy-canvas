import { ElementKind } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { PAGE_TYPE } from "./page.constants";
import type { PageElement } from "./page.types";

/** Pages are records, not layers: never shown on the canvas (see `PAGE_SCOPES`), drawn or hit. */
export class PageKind extends ElementKind<PageElement, DesignToolOptions> {
  readonly type = PAGE_TYPE;
  readonly label = "Page";
  readonly description = "A page of the design, holding its own layers.";
  override readonly creatable = false;
  override readonly boxed = false;

  draw(): void {}

  override hitTest(): boolean {
    return false;
  }

  override fillDefaults(el: PageElement): PageElement {
    return { ...el, name: el.name ?? this.label };
  }
}
