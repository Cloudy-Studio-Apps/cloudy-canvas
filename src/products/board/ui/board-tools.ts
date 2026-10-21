import {
  Database,
  Spline,
  Frame,
  Hand,
  Highlighter,
  MousePointer2,
  Network,
  Shapes,
  StickyNote,
  Type,
} from "lucide-react";

import type { BoardToolItem } from "./board-tools.types";

/** Toolbar layout: groups are separated by a divider. Shortcuts come from the board's keymap. */
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
    { id: "text", element: "text", icon: Type },
    { id: "shape", element: "geo", icon: Shapes },
    { id: "connector", element: "connector", icon: Spline },
    { id: "section", element: "section", icon: Frame },
    { id: "db", element: "db-table", icon: Database },
    { id: "er", element: "er-entity", icon: Network },
  ],
];
