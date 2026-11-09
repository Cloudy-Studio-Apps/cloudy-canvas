import {
  CanvasFileContext,
  CloseFileGuard,
  EditorModulesContext,
  EngineContext,
  NO_PROJECT_LIBRARIES,
  ProjectLibrariesContext,
  ProjectMissingDialog,
  useCanvasFileSaver,
  useHostedFile,
  useLiveGuestFile,
  useProjectLibraries,
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
  const libraries = useProjectLibraries(engine, file);
  return <DesignSessionView engine={engine} file={file} libraries={libraries} />;
}

function LiveDesignSession({ engine, live }: LiveDesignSessionProps) {
  const file = useLiveGuestFile(live, engine, "design");
  return <DesignSessionView engine={engine} file={file} />;
}

function DesignSessionView({ engine, file, libraries }: DesignSessionViewProps) {
  useAgentDesign(file.id, engine, file);
  return (
    <EngineContext value={engine}>
      <EditorModulesContext value={getDesignEditorModules()}>
        <CanvasFileContext value={file}>
          <ProjectLibrariesContext value={libraries ?? NO_PROJECT_LIBRARIES}>
            <CloseFileGuard />
            {libraries && <ProjectMissingDialog libraries={libraries} fileName={file.name} />}
            <DesignChrome />
          </ProjectLibrariesContext>
        </CanvasFileContext>
      </EditorModulesContext>
    </EngineContext>
  );
}
