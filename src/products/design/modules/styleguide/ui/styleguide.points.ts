import { definePoint } from "@shared/core";

import type { StyleguideStartAction } from "./styleguide.points.types";

/**
 * The buttons the Design system shows when the file has no colors yet (the color wizard adds
 * one), next to the built-in "Add a color".
 */
export const styleguideStartActions = definePoint<StyleguideStartAction>(
  "design.styleguideStartActions",
  { keyOf: (action) => action.id },
);
