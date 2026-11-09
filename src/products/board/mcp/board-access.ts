import { stringList, type ToolArgs } from "@canvas";

import type { BoardWorkspace } from "../board-engine.types";
import type { AgentBoard, AgentHost } from "./board-mcp.types";

export function requireBoard(host: AgentHost): AgentBoard {
  const board = host.board();
  if (!board) throw new Error("No board is open. Call file_open or file_new first.");
  return board;
}

/** The ids, after checking each is a shape on the board. */
export function requireShapes(engine: BoardWorkspace, ids: string[]): string[] {
  const missing = ids.find((id) => !engine.getElement(id));
  if (missing) throw new Error(`No shape with id ${missing}.`);
  return ids;
}

/** The `ids` given (each checked), or `undefined` when omitted (the whole board). */
export function optionalShapeIds(engine: BoardWorkspace, args: ToolArgs): string[] | undefined {
  if (args.ids === undefined || args.ids === null) return undefined;
  const ids = requireShapes(engine, stringList(args, "ids"));
  if (ids.length === 0) throw new Error('"ids" is empty: omit it for the whole board.');
  return ids;
}
