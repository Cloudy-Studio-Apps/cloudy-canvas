import type { StyleguideTemplate } from "../../styleguide.types";
import { strokeSamples } from "./stroke-kit";
import { t } from "../../styleguide.i18n";

/** A box outlined by each stroke. */
export const boxesTemplate: StyleguideTemplate = {
  id: "strokes.boxes",
  category: "strokes",
  label: t("templates.strokes.boxes.label"),
  description: t("templates.strokes.boxes.description"),
  options: [],
  build: (group, _options, context) =>
    strokeSamples(group, context, { w: 96, h: 96 }, "horizontal"),
};
