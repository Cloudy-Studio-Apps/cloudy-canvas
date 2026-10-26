/** The Design system mode's id (`engine.setMode`, `EngineState.mode`). */
export const STYLEGUIDE_MODE_ID = "styleguide";
/** The tool the mode starts with: it selects sections, never moves or resizes them. */
export const STYLEGUIDE_TOOL = "styleguide-select";

/** The module's host commands. */
export const STYLEGUIDE_COMMANDS = {
  open: "styleguide.open",
  convert: "styleguide.convert",
  exportSystem: "styleguide.exportSystem",
  exportSection: "styleguide.exportSection",
  /** The "Add to page" submenu (allowed in the mode by its id). */
  addToPage: "styleguide.addToPage",
} as const;
