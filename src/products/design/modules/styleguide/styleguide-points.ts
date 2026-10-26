import { definePoint } from "@shared/core";

import type { StyleguideCategory, StyleguideTemplate } from "./styleguide.types";

/** The sections of the Design system (Colors, Typography, …), keyed by id. */
export const styleguideCategories = definePoint<StyleguideCategory>("design.styleguideCategories", {
  keyOf: (category) => category.id,
});

/** How a category's groups can be drawn, keyed by id. */
export const styleguideTemplates = definePoint<StyleguideTemplate>("design.styleguideTemplates", {
  keyOf: (template) => template.id,
});
