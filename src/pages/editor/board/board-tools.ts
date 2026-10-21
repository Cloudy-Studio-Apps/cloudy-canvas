import { Hand, Highlighter, MousePointer2, Shapes, StickyNote } from "lucide-react";

import type { BoardToolItem } from "./board-tools.types";

/** Toolbar layout: groups are separated by a divider. Shortcuts come from the engine keymap. */
export const BOARD_TOOL_GROUPS: BoardToolItem[][] = [
  [
    {
      id: "select",
      label: "Select",
      description: "Select, move and resize. Double-click to edit text.",
      icon: MousePointer2,
    },
    { id: "hand", label: "Hand", description: "Pan around the board.", icon: Hand },
  ],
  [
    { id: "marker", element: "stroke", icon: Highlighter },
    { id: "sticky", element: "sticky", icon: StickyNote },
    { id: "shape", element: "geo", icon: Shapes },
  ],
];
