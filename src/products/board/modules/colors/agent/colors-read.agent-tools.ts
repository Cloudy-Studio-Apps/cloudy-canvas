import { describeAxis, describeVariable, DOCUMENT_TOKENS } from "@canvas";

import { requireBoard } from "../../../agent/board-access";
import type { BoardAgentTool } from "../../../agent/board-agent.types";

/** Reading the board's colors. */
export const colorsReadTools: BoardAgentTool[] = [
  {
    name: "list_board_colors",
    description:
      "The board's colors (its color variables): by collection, with their values per mode, " +
      "what each follows (an alias) and how many shapes use it; and the mode axes with the " +
      "mode the whole board shows.",
    inputSchema: { type: "object", properties: {} },
    run: (host) => {
      const { engine } = requireBoard(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const store = tokens.store();
      return {
        axes: store.axes().map((axis) => describeAxis(store, axis)),
        collections: store.collections().map((collection) => ({
          id: collection.id,
          name: collection.name,
          colors: store
            .variables(collection.id)
            .filter((v) => v.type === "color")
            .map((v) => describeVariable(store, v, tokens.usageOf(v.id).layers.length)),
        })),
      };
    },
  },
];
