import { definePoint } from "@shared/core";

import type { DesignStarter, StyleTypeEntry } from "./core.points.types";

/** The kinds of style the Styles section lists and adds (see `StyleTypeEntry`). */
export const designStyleTypes = definePoint<StyleTypeEntry>("design.styleTypes", {
  keyOf: (entry) => entry.id,
});

/** Ready-made starts for a new design, listed on Home's first run (see `useDesignStartStarter`). */
export const designStarters = definePoint<DesignStarter>("design.starters", {
  keyOf: (starter) => starter.id,
});
