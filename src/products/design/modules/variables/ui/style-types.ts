import { definePoint } from "@shared/core";

import type { StyleTypeEntry } from "./style-types.types";

/** The kinds of style the Styles section lists and adds (see `StyleTypeEntry`). */
export const designStyleTypes = definePoint<StyleTypeEntry>("design.styleTypes", {
  keyOf: (entry) => entry.id,
});
