import { BoardChrome } from "./board-chrome";
import { EngineContext } from "./engine/engine-context";
import { BoardFileContext, useBoardSaver } from "./file";
import type { BoardSessionProps } from "./board-session.types";

/** A loaded board: provides the engine and its file to the chrome around the canvas. */
export function BoardSession({ id, engine, info }: BoardSessionProps) {
  const file = useBoardSaver(id, engine, info);

  return (
    <EngineContext value={engine}>
      <BoardFileContext value={file}>
        <BoardChrome />
      </BoardFileContext>
    </EngineContext>
  );
}
