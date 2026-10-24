import { CATALOG_COMMANDS } from "./catalog-mode.constants";

/**
 * The only commands that run in the Catalog mode, which organizes pages and never edits them:
 * history, selecting (Delete takes pages out, see `CatalogTool`), the view, the file and its own.
 */
export const CATALOG_ALLOWED_COMMANDS: readonly string[] = [
  "undo",
  "redo",
  "cancel",
  "selectAll",
  "deleteSelection",
  "editSelection",
  "copyAsPng",
  "zoomIn",
  "zoomOut",
  "zoomReset",
  "zoomToFit",
  "zoomToSelection",
  "nextFrame",
  "previousFrame",
  "previousPage",
  "nextPage",
  "save",
  "saveAs",
  "export",
  "toggleUi",
  "toggleLeftPanel",
  "toggleRightPanel",
  ...Object.values(CATALOG_COMMANDS),
];
