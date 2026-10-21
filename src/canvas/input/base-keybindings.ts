import type { Keybindings } from "./keymap.types";

/** Bindings for the commands every canvas has. Products spread these and add their tools'. */
export const BASE_KEYBINDINGS = {
  undo: [{ key: "z", mod: true }],
  redo: [
    { key: "z", mod: true, shift: true },
    { key: "y", mod: true },
  ],
  selectAll: [{ key: "a", mod: true }],
  deleteSelection: [
    { key: "Delete", label: "Del" },
    { key: "Backspace", label: "⌫" },
  ],
  copy: [{ key: "c", mod: true }],
  cut: [{ key: "x", mod: true }],
  paste: [{ key: "v", mod: true }],
  duplicate: [{ key: "d", mod: true }],
  editSelection: [{ key: "Enter", label: "↵" }],
  cancel: [{ key: "Escape", label: "Esc" }],
  zoomIn: [
    { key: "=", mod: true, label: "+" },
    { key: "+", mod: true },
    { key: "+", mod: true, shift: true },
  ],
  zoomOut: [{ key: "-", mod: true, label: "−" }],
  zoomReset: [{ key: "0", mod: true }],
  zoomToFit: [{ code: "Digit1", shift: true, label: "1" }],
  save: [{ key: "s", mod: true }],
  saveAs: [{ key: "s", mod: true, shift: true }],
  "tool.select": [{ key: "v" }],
  "tool.hand": [{ key: "h" }],
} satisfies Keybindings;
