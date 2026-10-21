import type { ComponentType } from "react";

import { useEngineState } from "@canvas-ui";
import { ConnectorOptions } from "./connector-options";
import { DbOptions } from "./db-options";
import { DrawOptions } from "./draw-options";
import { ImageOptions } from "./image-options";
import { SectionOptions } from "./section-options";
import { ShapeOptions } from "./shape-options";
import { StickyOptions } from "./sticky-options";
import { StickerWheel } from "../sticker-picker";
import { TableOptions } from "./table-options";

/** Options panel per tool; tools without options show nothing. */
const OPTION_PANELS: Partial<Record<string, ComponentType>> = {
  marker: DrawOptions,
  eraser: DrawOptions,
  sticky: StickyOptions,
  shape: ShapeOptions,
  section: SectionOptions,
  table: TableOptions,
  connector: ConnectorOptions,
  db: DbOptions,
  sticker: StickerWheel,
};

/** With the select tool, the panel for the selection's type (when it's all one restylable type). */
const SELECTION_PANELS: Partial<Record<string, ComponentType>> = {
  sticky: StickyOptions,
  stroke: DrawOptions,
  geo: ShapeOptions,
  section: SectionOptions,
  table: TableOptions,
  connector: ConnectorOptions,
  image: ImageOptions,
};

export function ToolOptions() {
  const tool = useEngineState((state) => state.tool);
  const selectionTypes = useEngineState((state) => state.selectionTypes);
  const Panel =
    OPTION_PANELS[tool] ?? (tool === "select" ? SELECTION_PANELS[selectionTypes] : undefined);
  return Panel ? <Panel /> : null;
}
