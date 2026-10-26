import { STYLEGUIDE_COMMANDS } from "./styleguide-mode.constants";

/**
 * The only commands that run in the Design system mode, whose content is generated: history,
 * selecting, the view, copying a picture, exporting, the file and its own.
 */
export const STYLEGUIDE_ALLOWED_COMMANDS: readonly string[] = [
  "undo",
  "redo",
  "cancel",
  "selectAll",
  "copyAsPng",
  "zoomIn",
  "zoomOut",
  "zoomReset",
  "zoomToFit",
  "zoomToSelection",
  "nextFrame",
  "previousFrame",
  "save",
  "saveAs",
  "export",
  "toggleUi",
  "toggleLeftPanel",
  "toggleRightPanel",
  STYLEGUIDE_COMMANDS.exportSystem,
  STYLEGUIDE_COMMANDS.exportSection,
  STYLEGUIDE_COMMANDS.addToPage,
];
