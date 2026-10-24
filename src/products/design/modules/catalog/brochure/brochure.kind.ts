import { ElementKind } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { BROCHURE_TYPE } from "./brochure.constants";
import { BROCHURE_DEFAULTS } from "./brochure.defaults";
import type { BrochureDefaults, BrochureElement, BrochureSettings } from "./brochure.types";

/**
 * A brochure is a record, not a layer: never on a page's canvas (`PAGE_SCOPES` shows only nodes),
 * drawn or hit. It's edited through `DESIGN_BROCHURES`.
 */
export class BrochureKind extends ElementKind<BrochureElement, DesignToolOptions> {
  readonly type = BROCHURE_TYPE;
  readonly label = "Brochure";
  readonly description = "A brochure of a design page: its pages in order and how it prints.";
  override readonly defaults: BrochureDefaults = BROCHURE_DEFAULTS;
  override readonly creatable = false;
  override readonly boxed = false;

  draw(): void {}

  override hitTest(): boolean {
    return false;
  }

  override fillDefaults(el: BrochureElement): BrochureElement {
    // Brochures from before layouts had `facing` (pages in spreads, or one at a time).
    const { facing, ...settings } = (el.settings ?? {}) as Partial<BrochureSettings> & {
      facing?: boolean;
    };
    const layout =
      settings.layout ?? (facing === false ? "single" : BROCHURE_DEFAULTS.settings.layout);
    return {
      ...el,
      name: el.name || BROCHURE_DEFAULTS.name,
      // Brochures from before pages had one (`splitLegacyBrochure` gives them theirs on open).
      page: el.page ?? "",
      slots: el.slots ?? [],
      settings: { ...BROCHURE_DEFAULTS.settings, ...settings, layout },
    };
  }
}
