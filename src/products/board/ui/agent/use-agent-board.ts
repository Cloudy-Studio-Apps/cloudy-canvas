import { useEffect } from "react";

import type { BoardEngine } from "@board";
import type { CanvasFileContextValue } from "@canvas-ui";
import { getActiveBoard, setActiveBoard } from "./active-board";

/** Makes this board the one agents act on while it's open. */
export function useAgentBoard(id: string, engine: BoardEngine, file: CanvasFileContextValue): void {
  const { name, path, dirty, save } = file;

  useEffect(() => {
    setActiveBoard({ id, engine, name, path, dirty, save });
  }, [id, engine, name, path, dirty, save]);

  useEffect(
    () => () => {
      if (getActiveBoard()?.engine === engine) setActiveBoard(null);
    },
    [engine],
  );
}
