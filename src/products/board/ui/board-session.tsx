import { EngineContext } from "@canvas-ui";

import { useAgentBoard } from "./agent";
import { BoardChrome } from "./board-chrome";
import { ErModelContext, useErModelOf } from "./er";
import { BoardFileContext, useBoardSaver } from "./file";
import { BoardSchemaContext, useDbSchema } from "./schema";
import type { BoardSessionProps } from "./board-session.types";

/**
 * A loaded board: provides the engine, its file, its database schema and its ER diagrams to the
 * chrome around the canvas.
 */
export function BoardSession({ id, engine, info }: BoardSessionProps) {
  const file = useBoardSaver(id, engine, info);
  const schema = useDbSchema(engine);
  const er = useErModelOf(engine);
  useAgentBoard(id, { engine, schema, er }, file);

  return (
    <EngineContext value={engine}>
      <BoardFileContext value={file}>
        <BoardSchemaContext value={schema}>
          <ErModelContext value={er}>
            <BoardChrome />
          </ErModelContext>
        </BoardSchemaContext>
      </BoardFileContext>
    </EngineContext>
  );
}
