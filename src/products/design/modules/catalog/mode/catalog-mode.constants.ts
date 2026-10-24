/** The Catalog mode's id (`engine.setMode`, `EngineState.mode`, `?mode=catalog` links). */
export const CATALOG_MODE_ID = "catalog";
/** The tool the mode starts with: it selects pages, never moves or resizes them. */
export const CATALOG_TOOL = "catalog";
/** The tool that ticks the frames the brochure uses (the "Pick frames" button). */
export const CATALOG_PICK_TOOL = "catalog-pick";

/** The mode's host commands (its toolbar's buttons). */
export const CATALOG_COMMANDS = {
  pick: "catalog.pick",
  preview: "catalog.preview",
  exportPdf: "catalog.exportPdf",
} as const;
