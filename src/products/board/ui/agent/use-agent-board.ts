import { useEffect } from "react";

import type { BoardEngine, DbSchema } from "@board";
import type { BoardFileContextValue } from "../file";
import { getActiveBoard, setActiveBoard } from "./active-board";

/** Makes this board the one agents act on while it's open. */
export function useAgentBoard(
  id: string,
  engine: BoardEngine,
  schema: DbSchema,
  file: BoardFileContextValue,
): void {
  const { name, path, dirty, save } = file;

  useEffect(() => {
    setActiveBoard({ id, engine, schema, name, path, dirty, save });
  }, [id, engine, schema, name, path, dirty, save]);

  useEffect(
    () => () => {
      if (getActiveBoard()?.engine === engine) setActiveBoard(null);
    },
    [engine],
  );
}
