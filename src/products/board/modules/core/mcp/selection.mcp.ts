import {
  optionalBoolean,
  SELECTION_GET_TOOL,
  SELECTION_SET_TOOL,
  stringList,
  summarizeElement,
  TokenStore,
} from "@canvas";

import { boundColors } from "../../../tokens";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";

/** The board's side of the shared `selection` topic: `selection_get`, `selection_set`. */
export const selectionTools: BoardMcpTool[] = [
  {
    ...SELECTION_GET_TOOL,
    run: (host) => {
      const { engine } = requireBoard(host);
      return engine
        .userSelection()
        .map((id) => engine.getElement(id) ?? engine.doc.get(id))
        .filter((el) => el !== undefined)
        .map((el) => ({
          ...summarizeElement(engine.kinds, el),
          ...boundColors(TokenStore.of(engine.doc), el),
        }));
    },
  },
  {
    ...SELECTION_SET_TOOL,
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const ids = stringList(args, "ids").filter((id) => engine.getElement(id));
      const [first] = ids;
      if (optionalBoolean(args, "zoom") && first && ids.length === 1) engine.zoomToElement(first);
      else engine.select(ids);
      return { selected: engine.selectedIds() };
    },
  },
];
