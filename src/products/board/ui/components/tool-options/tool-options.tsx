import type { ComponentType } from "react";

import { useEngineState } from "@canvas-ui";
import { DbOptions } from "./db-options";
import { MarkerOptions } from "./marker-options";
import { SectionOptions } from "./section-options";
import { ShapeOptions } from "./shape-options";
import { StickyOptions } from "./sticky-options";

/** Options panel per tool; tools without options show nothing. */
const OPTION_PANELS: Partial<Record<string, ComponentType>> = {
  marker: MarkerOptions,
  sticky: StickyOptions,
  shape: ShapeOptions,
  section: SectionOptions,
  db: DbOptions,
};

/** With the select tool, the panel for the selection's type (when it's all one restylable type). */
const SELECTION_PANELS: Partial<Record<string, ComponentType>> = {
  sticky: StickyOptions,
  geo: ShapeOptions,
  section: SectionOptions,
};

export function ToolOptions() {
  const tool = useEngineState((state) => state.tool);
  const selectionTypes = useEngineState((state) => state.selectionTypes);
  const Panel =
    OPTION_PANELS[tool] ?? (tool === "select" ? SELECTION_PANELS[selectionTypes] : undefined);
  return Panel ? <Panel /> : null;
}
