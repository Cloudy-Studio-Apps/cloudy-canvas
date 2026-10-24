import { useMemo } from "react";

import { useThemeMetrics } from "@shared/ui/theme";
import type { LayerListMetrics } from "./drag/layer-drop.types";

/** The layers list's rows: as tall as the theme's rows (28 px by default), indented 14 px a level after 4 px. */
export function useLayerMetrics(): LayerListMetrics {
  const { rowHeight } = useThemeMetrics();
  return useMemo(() => ({ rowHeight, indent: 14, baseIndent: 4 }), [rowHeight]);
}
