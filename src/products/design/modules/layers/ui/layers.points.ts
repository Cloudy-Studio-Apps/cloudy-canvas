import { definePoint } from "@shared/core";

import type { LayersTabSection } from "./layers.points.types";

/** What other modules show in the Layers tab, under the layer tree (see `LayersTabSection`). */
export const layersTabSections = definePoint<LayersTabSection>("design.layersTabSections", {
  keyOf: (section) => section.id,
});
