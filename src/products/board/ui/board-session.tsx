import { EngineContext } from "@canvas-ui";

import { useAgentBoard } from "./agent";
import { BoardChrome } from "./board-chrome";
import { BoardFileContext, useBoardSaver } from "./file";
import type { BoardSessionProps } from "./board-session.types";

/** A loaded board: provides the engine and its file to the chrome around the canvas. */
export function BoardSession({ id, engine, info }: BoardSessionProps) {
  const file = useBoardSaver(id, engine, info);
  useAgentBoard(id, engine, file);

  return (
    <EngineContext value={engine}>
      <BoardFileContext value={file}>
        <BoardChrome />
      </BoardFileContext>
    </EngineContext>
  );
}
