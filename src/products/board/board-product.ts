import type { CanvasProduct } from "@canvas";

import { DEFAULT_BOARD_OPTIONS } from "./board-options";
import type { BoardToolOptions } from "./board-options.types";
import { BOARD_KEYBINDINGS } from "./board-keybindings";
import {
  boardKinds,
  createPastedText,
  DbLinks,
  detachConnectors,
  ErLinks,
  prepareConnectorCopies,
  prepareDbCopies,
  prepareErCopies,
  pruneEr,
  pruneRefs,
  resolveConnectors,
  resolveErElements,
  withErMembers,
  withSectionMembers,
} from "./elements";
import {
  ConnectorTool,
  DbTool,
  ErTool,
  MarkerTool,
  SectionTool,
  ShapeTool,
  StickyTool,
  TextTool,
} from "./tools";

/**
 * Boards (`.cboard`, FigJam-style): sticky notes, text, marker strokes, diagram shapes, connectors, sections,
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
    new ConnectorTool(ctx),
    new DbTool(ctx),
    new ErTool(ctx),
  ],
  keybindings: BOARD_KEYBINDINGS,
  defaultOptions: DEFAULT_BOARD_OPTIONS,
  createLinks: () => [new DbLinks(), new ErLinks()],
  // Aggregation boxes and constraints follow the ER elements they're about, and connectors follow
  // whatever they're attached to (ER boxes included, so they're resolved last).
  resolveElements: (elements) => resolveConnectors(resolveErElements(elements), boardKinds),
  // A section takes everything inside it; an ER element takes its attributes along, and dragging
  // an aggregation box takes what it holds.
  withMembers: (ids, elements, purpose) =>
    withErMembers(withSectionMembers(ids, elements, boardKinds), elements, purpose === "move"),
  // Connectors attached to deleted elements keep a free end where they were; relations pointing
  // at deleted tables or columns go with them, and so do ER elements that belonged to deleted ones.
  onRemove: (doc, removed, before) => {
    detachConnectors(doc, removed, before);
    pruneRefs(doc);
    pruneEr(doc);
  },
  // Copies get free schema names and their own ER diagrams, and connector ends attached to
  // elements that weren't copied come loose.
  prepareCopies: (copies, context) =>
    prepareConnectorCopies(prepareErCopies(prepareDbCopies(copies, context), context), context),
  pasteText: (text, at, index) => createPastedText(text, at, index),
};
