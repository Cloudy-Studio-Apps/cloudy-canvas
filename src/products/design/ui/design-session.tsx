import {
  CanvasFileContext,
  CloseFileGuard,
  EditorModulesContext,
  EngineContext,
  useCanvasFileSaver,
  useCanvasThumbnail,
  useHostedFile,
  useLiveGuestFile,
} from "@canvas-ui";
import { useAgentDesign } from "./agent";
import { DesignChrome } from "./design-chrome";
import type {
  DesignSessionProps,
  DesignSessionViewProps,
  FileDesignSessionProps,
  LiveDesignSessionProps,
} from "./design-session.types";
import { DESIGN_FILE_FORMAT } from "./file";
import { getDesignEditorModules } from "./modules";

/**
 * A loaded design: provides the engine, its file and the design's modules to the chrome, which
 * runs the modules' session hooks and overlays, and makes it the design agents act on. A design
 * file is saved here; a live session's design is the host's, so it isn't.
 */
export function DesignSession({ id, engine, info, live }: DesignSessionProps) {
  return live ? (
    <LiveDesignSession engine={engine} live={live} />
  ) : (
    <FileDesignSession id={id} engine={engine} info={info} />
  );
}

function FileDesignSession({ id, engine, info }: FileDesignSessionProps) {
  const file = useHostedFile(useCanvasFileSaver(id, engine, info, DESIGN_FILE_FORMAT), engine);
  const capture = useCanvasThumbnail(id, engine, file.saved);
  return <DesignSessionView engine={engine} file={file} capture={capture} />;
}

function LiveDesignSession({ engine, live }: LiveDesignSessionProps) {
  const file = useLiveGuestFile(live, engine, "design");
  return <DesignSessionView engine={engine} file={file} />;
}

function DesignSessionView({ engine, file, capture }: DesignSessionViewProps) {
  useAgentDesign(file.id, engine, file);
  return (
    <EngineContext value={engine}>
      <EditorModulesContext value={getDesignEditorModules()}>
        <CanvasFileContext value={file}>
          {capture && <CloseFileGuard capture={capture} />}
          <DesignChrome />
        </CanvasFileContext>
      </EditorModulesContext>
    </EngineContext>
  );
}
