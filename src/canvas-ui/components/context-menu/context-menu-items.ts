import { BASE_COMMAND_LABELS } from "@canvas";

import type {
  ContextMenuAction,
  ContextMenuCategory,
  ContextMenuContext,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSubmenu,
} from "./context-menu-items.types";

const hasSelection = ({ selectionCount }: ContextMenuContext) => selectionCount > 0;
const unlockAll: ContextMenuItem = { command: "unlockAll", enabled: ({ anyLocked }) => anyLocked };

const ALIGN_COMMANDS = [
  "alignLeft",
  "alignCenterX",
  "alignRight",
  "alignTop",
  "alignCenterY",
  "alignBottom",
] as const;

/** Align (one element with what holds it, or several), distribute and tidy up the selection. */
const arrangeSubmenu: ContextMenuSubmenu = {
  id: "arrange",
  label: "Align",
  actions: (engine, { selectionCount }) => {
    const ids = engine.selectedIds();
    const run = (command: keyof typeof BASE_COMMAND_LABELS): ContextMenuAction => ({
      label: BASE_COMMAND_LABELS[command],
      run: () => engine.commands[command]?.(),
    });
    return [
      ...(engine.canAlign(ids) ? ALIGN_COMMANDS.map(run) : []),
      ...(selectionCount >= 3 ? [run("distributeHorizontal"), run("distributeVertical")] : []),
      ...(selectionCount >= 2 ? [run("tidyUp")] : []),
    ];
  },
};

/** Copy and paste properties, and the selection as a picture. */
const copyPasteAs: ContextMenuCategory = {
  id: "copy-paste-as",
  label: "Copy/Paste as",
  groups: [
    [
      { command: "copyProperties", enabled: hasSelection },
      {
        command: "pasteProperties",
        enabled: (context) => hasSelection(context) && context.styleCopied,
      },
    ],
    [{ command: "copyAsPng", enabled: hasSelection }],
  ],
};

/** The drawing order. */
const order: ContextMenuCategory = {
  id: "order",
  label: "Order",
  groups: [
    [
      { command: "bringToFront", enabled: hasSelection },
      { command: "bringForward", enabled: hasSelection },
      { command: "sendBackward", enabled: hasSelection },
      { command: "sendToBack", enabled: hasSelection },
    ],
  ],
};

/**
 * The menu of a right-click on elements (they're selected first). The everyday commands are
 * listed; the rest are in submenus, so it fits on screen with what the modules add.
 */
export const SELECTION_MENU: readonly ContextMenuGroup[] = [
  [
    { command: "cut", enabled: hasSelection },
    { command: "copy", enabled: hasSelection },
    { command: "paste" },
    { command: "pasteToReplace", enabled: hasSelection },
    { command: "duplicate", enabled: hasSelection },
    { command: "deleteSelection", enabled: hasSelection, destructive: true },
  ],
  [copyPasteAs, { command: "export", label: "Export selection…", enabled: hasSelection }],
  [arrangeSubmenu, order, { command: "zoomToSelection", enabled: hasSelection }],
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
