import type { ComponentType } from "react";

import type { ToolId } from "@engine";
import { useEngineState } from "../../engine/engine-context";
import { MarkerOptions } from "./marker-options";
import { StickyOptions } from "./sticky-options";

/** Options panel per tool; tools without options show nothing. */
const OPTION_PANELS: Partial<Record<ToolId, ComponentType>> = {
  marker: MarkerOptions,
  sticky: StickyOptions,
};

export function ToolOptions() {
  const tool = useEngineState((state) => state.tool);
  const Panel = OPTION_PANELS[tool];
  return Panel ? <Panel /> : null;
}
