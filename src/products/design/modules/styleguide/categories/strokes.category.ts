import { STROKE_STYLE } from "../../core";
import { styleGroups } from "../sheet";
import type { StyleguideCategory } from "../styleguide.types";
import { numbers } from "./category-tokens";

/** Stroke styles, then number variables for stroke weights. */
export const strokesCategory: StyleguideCategory = {
  id: "strokes",
  label: "Strokes",
  order: 70,
  defaultTemplate: "strokes.lines",
  groups: (store) => [...styleGroups(store.styles(STROKE_STYLE)), ...numbers(store, "stroke")],
};
