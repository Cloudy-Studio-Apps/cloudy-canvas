import type { ComponentType } from "react";

import type { ShapeType, ToolId } from "@engine";
import { useEngineState } from "../../engine/engine-context";
import { ConnectorOptions } from "./connector-options";
import { MarkerOptions } from "./marker-options";
import { SectionOptions } from "./section-options";
import { ShapeOptions } from "./shape-options";
import { StickyOptions } from "./sticky-options";

/** Options panel per tool; tools without options show nothing. */
const OPTION_PANELS: Partial<Record<ToolId, ComponentType>> = {
  marker: MarkerOptions,
  sticky: StickyOptions,
  shape: ShapeOptions,
  connector: ConnectorOptions,
  section: SectionOptions,
};

/** With the select tool, the panel for the selection's type (when it's all one restylable type). */
const SELECTION_PANELS: Partial<Record<ShapeType, ComponentType>> = {
  sticky: StickyOptions,
  geo: ShapeOptions,
  connector: ConnectorOptions,
  section: SectionOptions,
};

export function ToolOptions() {
  const tool = useEngineState((state) => state.tool);
  const selectionTypes = useEngineState((state) => state.selectionTypes);
  const Panel =
    OPTION_PANELS[tool] ??
    (tool === "select" ? SELECTION_PANELS[selectionTypes as ShapeType] : undefined);
  return Panel ? <Panel /> : null;
}
