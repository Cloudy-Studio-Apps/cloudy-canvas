import { ElementKind } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { BROCHURE_TYPE } from "./brochure.constants";
import { BROCHURE_DEFAULTS } from "./brochure.defaults";
import type { BrochureDefaults, BrochureElement } from "./brochure.types";

/**
 * The brochure is a record, not a layer: never on a page (`PAGE_SCOPES` shows only nodes), drawn
 * or hit. It's edited through `DESIGN_BROCHURE`.
 */
export class BrochureKind extends ElementKind<BrochureElement, DesignToolOptions> {
  readonly type = BROCHURE_TYPE;
  readonly label = "Brochure";
  readonly description = "The design's brochure: its pages in order and how it prints.";
  override readonly defaults: BrochureDefaults = BROCHURE_DEFAULTS;
  override readonly creatable = false;
  override readonly boxed = false;

  draw(): void {}

  override hitTest(): boolean {
    return false;
  }

  override fillDefaults(el: BrochureElement): BrochureElement {
    return {
      ...el,
      slots: el.slots ?? [],
      settings: { ...BROCHURE_DEFAULTS.settings, ...el.settings },
    };
  }
}
