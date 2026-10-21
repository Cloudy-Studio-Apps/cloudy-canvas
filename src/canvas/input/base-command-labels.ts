import type { BASE_KEYBINDINGS } from "./base-keybindings";

/** Names of the commands every canvas has, for shortcut lists. Tools are named by their product. */
export const BASE_COMMAND_LABELS: Record<keyof typeof BASE_KEYBINDINGS, string> = {
  undo: "Undo",
  redo: "Redo",
  selectAll: "Select all",
  deleteSelection: "Delete",
  copy: "Copy",
  cut: "Cut",
  paste: "Paste",
  duplicate: "Duplicate",
  editSelection: "Edit text",
  cancel: "Cancel or deselect",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  zoomReset: "Zoom to 100%",
  zoomToFit: "Zoom to fit",
  save: "Save",
  saveAs: "Save as",
  "tool.select": "Select",
  "tool.hand": "Hand",
};
