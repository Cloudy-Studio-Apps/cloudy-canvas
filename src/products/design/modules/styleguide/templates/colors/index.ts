import type { StyleguideTemplate } from "../../styleguide.types";
import { cardsTemplate } from "./cards.template";
import { circlesTemplate } from "./circles.template";
import { contrastPairsTemplate } from "./contrast-pairs.template";
import { listTemplate } from "./list.template";
import { modeColumnsTemplate } from "./mode-columns.template";
import { rampStripTemplate } from "./ramp-strip.template";
import { stripesTemplate } from "./stripes.template";
import { swatchGridTemplate } from "./swatch-grid.template";

/** The Colors category's templates. */
export const COLOR_TEMPLATES: readonly StyleguideTemplate[] = [
  swatchGridTemplate,
  rampStripTemplate,
  cardsTemplate,
  listTemplate,
  stripesTemplate,
  circlesTemplate,
  contrastPairsTemplate,
  modeColumnsTemplate,
];
