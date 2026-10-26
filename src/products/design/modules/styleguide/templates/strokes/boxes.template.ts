import type { StyleguideTemplate } from "../../styleguide.types";
import { strokeSamples } from "./stroke-kit";

/** A box outlined by each stroke. */
export const boxesTemplate: StyleguideTemplate = {
  id: "strokes.boxes",
  category: "strokes",
  label: "Boxes",
  description: "A box outlined by each stroke, with its name and summary.",
  options: [],
  build: (group, _options, context) =>
    strokeSamples(group, context, { w: 96, h: 96 }, "horizontal"),
};
