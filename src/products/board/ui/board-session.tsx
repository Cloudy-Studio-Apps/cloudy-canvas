import { EngineContext } from "@canvas-ui";

import { useAgentBoard } from "./agent";
import { BoardChrome } from "./board-chrome";
import { BoardFileContext, useBoardSaver } from "./file";
import { BoardSchemaContext, useDbSchema } from "./schema";
import type { BoardSessionProps } from "./board-session.types";

/** A loaded board: provides the engine and its file to the chrome around the canvas. */
export function BoardSession({ id, engine, info }: BoardSessionProps) {
  const file = useBoardSaver(id, engine, info);
  const schema = useDbSchema(engine);
  useAgentBoard(id, engine, schema, file);

  return (
    <EngineContext value={engine}>
      <BoardFileContext value={file}>
        <BoardSchemaContext value={schema}>
          <BoardChrome />
        </BoardSchemaContext>
      </BoardFileContext>
    </EngineContext>
  );
}
