import {
  CanvasFileContext,
  CloseFileGuard,
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
  const capture = useCanvasThumbnail(id, engine, file.saved);
  return <BoardSessionView engine={engine} file={file} capture={capture} />;
}

function LiveBoardSession({ engine, live }: LiveBoardSessionProps) {
  const file = useLiveGuestFile(live, engine, "board");
  return <BoardSessionView engine={engine} file={file} />;
}

function BoardSessionView({ engine, file, capture }: BoardSessionViewProps) {
  useAgentBoard(file.id, engine, file);
  return (
    <EngineContext value={engine}>
      <EditorModulesContext value={getBoardEditorModules()}>
        <CanvasFileContext value={file}>
          {capture && <CloseFileGuard capture={capture} />}
          <ModuleSession />
          <BoardChrome />
        </CanvasFileContext>
      </EditorModulesContext>
    </EngineContext>
  );
}
