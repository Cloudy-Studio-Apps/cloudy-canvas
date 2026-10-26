import type { CanvasEngine } from "@canvas";
import type { ContextMenuEntryGroup } from "@canvas-ui";
import { isSheet, STYLEGUIDE_COMMANDS, STYLEGUIDE_MODE_ID } from "@design";
import { ADD_TO_PAGE } from "./add-to-page";

/** Whether a live element is selected. */
function sheetSelected(_context: unknown, engine: CanvasEngine): boolean {
  return engine.selectedIds().some((id) => isSheet(engine.getElement(id)));
}

/**
 * The selection's "Design system" submenu: export the section or the whole system, add the
 * section to a page, and (outside the view) convert live elements into ordinary layers.
 */
export const STYLEGUIDE_MENU: ContextMenuEntryGroup = {
  id: "styleguide",
  menu: "selection",
  label: "Design system",
  items: [
    {
      command: STYLEGUIDE_COMMANDS.exportSection,
      label: "Export this section…",
      enabled: sheetSelected,
    },
    { command: STYLEGUIDE_COMMANDS.exportSystem, label: "Export design system as PDF…" },
    ADD_TO_PAGE,
    {
      command: STYLEGUIDE_COMMANDS.convert,
      label: "Convert to design",
      enabled: (context, engine) =>
        engine.modeId !== STYLEGUIDE_MODE_ID && sheetSelected(context, engine),
    },
  ],
};
