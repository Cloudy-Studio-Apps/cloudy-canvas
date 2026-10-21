import { Hand, Highlighter, MousePointer2, StickyNote, Type } from "lucide-react";

import type { BoardToolItem } from "./board-tools.types";

/** Toolbar layout: groups are separated by a divider. Shortcuts come from the engine keymap. */
export const BOARD_TOOL_GROUPS: BoardToolItem[][] = [
  [
    { id: "select", label: "Select", icon: MousePointer2 },
    { id: "hand", label: "Hand", icon: Hand },
  ],
  [
    { id: "marker", label: "Marker", icon: Highlighter },
    { id: "sticky", label: "Sticky note", icon: StickyNote },
    { id: "text", label: "Text", icon: Type },
  ],
];
