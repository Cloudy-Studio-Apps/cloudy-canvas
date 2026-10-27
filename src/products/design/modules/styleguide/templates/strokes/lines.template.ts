import type { StyleguideTemplate } from "../../styleguide.types";
import { strokeSamples } from "./stroke-kit";
import { t } from "../../styleguide.i18n";

/** A line sample per stroke, with its name and summary. */
export const linesTemplate: StyleguideTemplate = {
  id: "strokes.lines",
  category: "strokes",
  label: t("templates.strokes.lines.label"),
  description: t("templates.strokes.lines.description"),
  options: [],
  build: (group, _options, context) => strokeSamples(group, context, { w: 240, h: 24 }, "vertical"),
};
