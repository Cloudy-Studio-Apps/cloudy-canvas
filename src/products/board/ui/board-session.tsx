import {
  CanvasFileContext,
  EditorModulesContext,
  EngineContext,
  ModuleSession,
  useCanvasThumbnail,
  useHostedFile,
  useLiveGuestFile,
} from "@canvas-ui";

import { useAgentBoard } from "./agent";
import { BoardChrome } from "./board-chrome";
import { useBoardSaver } from "./file";
import { getBoardEditorModules } from "./modules";
import type {
  BoardSessionProps,
  BoardSessionViewProps,
  FileBoardSessionProps,
  LiveBoardSessionProps,
} from "./board-session.types";

/**
 * A loaded board: provides the engine, its file and the board's modules to the chrome around the
 * canvas, and runs the modules' session hooks and overlays. A board file is saved here; a live
 * session's board is the host's, so it isn't.
 */
export function BoardSession({ id, engine, info, live }: BoardSessionProps) {
  return live ? (
    <LiveBoardSession engine={engine} live={live} />
  ) : (
    <FileBoardSession id={id} engine={engine} info={info} />
  );
}

function FileBoardSession({ id, engine, info }: FileBoardSessionProps) {
  const file = useHostedFile(useBoardSaver(id, engine, info), engine);
  useCanvasThumbnail(id, engine);
  return <BoardSessionView engine={engine} file={file} />;
}

function LiveBoardSession({ engine, live }: LiveBoardSessionProps) {
  const file = useLiveGuestFile(live, engine, "board");
  return <BoardSessionView engine={engine} file={file} />;
}

function BoardSessionView({ engine, file }: BoardSessionViewProps) {
  useAgentBoard(file.id, engine, file);
  return (
    <EngineContext value={engine}>
      <EditorModulesContext value={getBoardEditorModules()}>
        <CanvasFileContext value={file}>
          <ModuleSession />
          <BoardChrome />
        </CanvasFileContext>
      </EditorModulesContext>
    </EngineContext>
  );
}
