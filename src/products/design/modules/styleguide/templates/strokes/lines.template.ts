import type { StyleguideTemplate } from "../../styleguide.types";
import { strokeSamples } from "./stroke-kit";

/** A line sample per stroke, with its name and summary. */
export const linesTemplate: StyleguideTemplate = {
  id: "strokes.lines",
  category: "strokes",
  label: "Line samples",
  description: "A long sample of each stroke, with its name and summary.",
  options: [],
  build: (group, _options, context) => strokeSamples(group, context, { w: 240, h: 24 }, "vertical"),
};
