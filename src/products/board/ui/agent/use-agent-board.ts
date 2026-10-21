import { useEffect } from "react";

import type { AgentBoard } from "@board";
import type { BoardFileContextValue } from "../file";
import { getActiveBoard, setActiveBoard } from "./active-board";

/** Makes this board the one agents act on while it's open. */
export function useAgentBoard(
  id: string,
  { engine, schema, er }: Pick<AgentBoard, "engine" | "schema" | "er">,
  file: BoardFileContextValue,
): void {
  const { name, path, dirty, save } = file;

  useEffect(() => {
    setActiveBoard({ id, engine, schema, er, name, path, dirty, save });
  }, [id, engine, schema, er, name, path, dirty, save]);

  useEffect(
    () => () => {
      if (getActiveBoard()?.engine === engine) setActiveBoard(null);
    },
    [engine],
  );
}
