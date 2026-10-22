import {
  CanvasFileContext,
  EditorModulesContext,
  EngineContext,
  useCanvasFileSaver,
  useCanvasThumbnail,
} from "@canvas-ui";
import { useAgentDesign } from "./agent";
import { DesignChrome } from "./design-chrome";
import type { DesignSessionProps } from "./design-session.types";
import { DESIGN_FILE_FORMAT } from "./file";
import { getDesignEditorModules } from "./modules";

/**
 * A loaded design: provides the engine, its file and the design's modules to the chrome, which
 * runs the modules' session hooks and overlays, and makes it the design agents act on.
 */
export function DesignSession({ id, engine, info }: DesignSessionProps) {
  const file = useCanvasFileSaver(id, engine, info, DESIGN_FILE_FORMAT);
  useCanvasThumbnail(id, engine);
  useAgentDesign(id, engine, file);

  return (
    <EngineContext value={engine}>
      <EditorModulesContext value={getDesignEditorModules()}>
        <CanvasFileContext value={file}>
          <DesignChrome />
        </CanvasFileContext>
      </EditorModulesContext>
    </EngineContext>
  );
}
