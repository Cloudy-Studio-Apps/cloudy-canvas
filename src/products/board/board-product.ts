import type { CanvasProduct } from "@canvas";

import { DEFAULT_BOARD_OPTIONS } from "./board-options";
import type { BoardToolOptions } from "./board-options.types";
import { BOARD_KEYBINDINGS } from "./board-keybindings";
import {
  boardKinds,
  DbLinks,
  ErLinks,
  pruneEr,
  pruneRefs,
  resolveErElements,
  withErMembers,
  withSectionMembers,
} from "./elements";
import { DbTool, ErTool, MarkerTool, SectionTool, ShapeTool, StickyTool, TextTool } from "./tools";

/**
 * Boards (`.cboard`, FigJam-style): sticky notes, text, marker strokes, diagram shapes, sections,
 * database schemas and ER diagrams.
 */
export const boardProduct: CanvasProduct<BoardToolOptions> = {
  id: "board",
  kinds: boardKinds,
  createTools: (ctx) => [
    new MarkerTool(ctx),
    new StickyTool(ctx),
    new TextTool(ctx),
    new ShapeTool(ctx),
    new SectionTool(ctx),
    new DbTool(ctx),
    new ErTool(ctx),
  ],
  keybindings: BOARD_KEYBINDINGS,
  defaultOptions: DEFAULT_BOARD_OPTIONS,
  createLinks: () => [new DbLinks(), new ErLinks()],
  // Aggregation boxes and constraints follow the ER elements they're about.
  resolveElements: resolveErElements,
  // A section takes everything inside it; an ER element takes its attributes along, and dragging
  // an aggregation box takes what it holds.
  withMembers: (ids, elements, purpose) =>
    withErMembers(withSectionMembers(ids, elements, boardKinds), elements, purpose === "move"),
  // Relations pointing at deleted tables or columns go with them, and so do ER elements that
  // belonged to deleted ones.
  onRemove: (doc) => {
    pruneRefs(doc);
    pruneEr(doc);
  },
};
