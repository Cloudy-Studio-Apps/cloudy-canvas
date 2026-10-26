import type { StyleguideTemplate } from "../styleguide.types";
import { COLOR_TEMPLATES } from "./colors";
import { coverMinimalTemplate } from "./cover/minimal.template";
import { coverTitleTemplate } from "./cover/title.template";
import { effectCardsTemplate } from "./effects/cards.template";
import { elevationTemplate } from "./effects/elevation.template";
import { checkerTemplate } from "./opacity/checker.template";
import { opacityTableTemplate } from "./opacity/table.template";
import { otherTableTemplate } from "./other/table.template";
import { paintCardsTemplate } from "./paint/cards.template";
import { paintSwatchesTemplate } from "./paint/swatches.template";
import { cornersTemplate } from "./radius/corners.template";
import { radiusTableTemplate } from "./radius/table.template";
import { barsTemplate } from "./spacing/bars.template";
import { squaresTemplate } from "./spacing/squares.template";
import { spacingTableTemplate } from "./spacing/table.template";
import { boxesTemplate } from "./strokes/boxes.template";
import { linesTemplate } from "./strokes/lines.template";
import { TYPOGRAPHY_TEMPLATES } from "./typography";

/** The built-in templates, each category's in the order its picker lists them. */
export const BUILT_IN_TEMPLATES: readonly StyleguideTemplate[] = [
  coverTitleTemplate,
  coverMinimalTemplate,
  ...COLOR_TEMPLATES,
  ...TYPOGRAPHY_TEMPLATES,
  barsTemplate,
  squaresTemplate,
  spacingTableTemplate,
  cornersTemplate,
  radiusTableTemplate,
  effectCardsTemplate,
  elevationTemplate,
  linesTemplate,
  boxesTemplate,
  paintSwatchesTemplate,
  paintCardsTemplate,
  checkerTemplate,
  opacityTableTemplate,
  otherTableTemplate,
];
