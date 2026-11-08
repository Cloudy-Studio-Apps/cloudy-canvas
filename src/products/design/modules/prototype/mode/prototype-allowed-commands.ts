import { PROTOTYPE_COMMANDS } from "../prototype.constants";

/**
 * The only commands that run in the Prototype mode, which links screens and never edits layers:
 * history, selecting, the view, the file and its own. Delete is the mode's own
 * `removeInteractions`; the engine's `deleteSelection` isn't allowed, so layers are never
 * deleted, whatever the tool.
 */
export const PROTOTYPE_ALLOWED_COMMANDS: readonly string[] = [
  "undo",
  "redo",
  "cancel",
  "selectAll",
  "selectParent",
  "copyAsPng",
  "copyAsSvg",
  "zoomIn",
  "zoomOut",
  "zoomReset",
  "zoomToFit",
  "centerOrigin",
  "zoomToSelection",
  "nextFrame",
  "previousFrame",
  "previousPage",
  "nextPage",
  "save",
  "saveAs",
  "export",
  "layerExport.all",
  "toggleUi",
  "toggleLeftPanel",
  "toggleRightPanel",
  ...Object.values(PROTOTYPE_COMMANDS),
];
