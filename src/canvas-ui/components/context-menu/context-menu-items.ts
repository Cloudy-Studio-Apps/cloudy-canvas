import type {
  ContextMenuContext,
  ContextMenuGroup,
  ContextMenuItem,
} from "./context-menu-items.types";

const hasSelection = ({ selectionCount }: ContextMenuContext) => selectionCount > 0;
const unlockAll: ContextMenuItem = { command: "unlockAll", enabled: ({ anyLocked }) => anyLocked };

/** The menu of a right-click on elements (they're selected first). */
export const SELECTION_MENU: readonly ContextMenuGroup[] = [
  [
    { command: "cut", enabled: hasSelection },
    { command: "copy", enabled: hasSelection },
    { command: "paste" },
    { command: "pasteToReplace", enabled: hasSelection },
    { command: "duplicate", enabled: hasSelection },
  ],
  [{ command: "deleteSelection", enabled: hasSelection, destructive: true }],
  [
    { command: "copyAsPng", enabled: hasSelection },
    { command: "export", label: "Export selection…", enabled: hasSelection },
  ],
  [
    { command: "bringToFront", enabled: hasSelection },
    { command: "bringForward", enabled: hasSelection },
    { command: "sendBackward", enabled: hasSelection },
    { command: "sendToBack", enabled: hasSelection },
  ],
  [
    {
      command: "toggleLock",
      label: ({ selectionLocked }) => (selectionLocked ? "Unlock" : "Lock"),
      enabled: hasSelection,
    },
    unlockAll,
  ],
];

/** The menu of a right-click on the empty canvas. */
export const CANVAS_MENU: readonly ContextMenuGroup[] = [
  [{ command: "paste" }],
  [{ command: "selectAll" }, { command: "zoomToFit" }],
  [{ command: "export", label: "Export board…" }],
  [unlockAll],
];
