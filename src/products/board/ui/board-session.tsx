import { EditorModulesContext, EngineContext, ModuleSession } from "@canvas-ui";

import { useAgentBoard } from "./agent";
import { BoardChrome } from "./board-chrome";
import { BoardFileContext, useBoardSaver, useBoardThumbnail } from "./file";
import { getBoardEditorModules } from "./modules";
import type { BoardSessionProps } from "./board-session.types";

/**
 * A loaded board: provides the engine, its file and the board's modules to the chrome around the
 * canvas, and runs the modules' session hooks and overlays.
 */
export function BoardSession({ id, engine, info }: BoardSessionProps) {
  const file = useBoardSaver(id, engine, info);
  useAgentBoard(id, engine, file);
  useBoardThumbnail(id, engine);

  return (
    <EngineContext value={engine}>
      <EditorModulesContext value={getBoardEditorModules()}>
        <BoardFileContext value={file}>
          <ModuleSession />
          <BoardChrome />
        </BoardFileContext>
      </EditorModulesContext>
    </EngineContext>
  );
}
