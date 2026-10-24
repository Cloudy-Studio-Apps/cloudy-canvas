import {
  CollaboratorLayer,
  CanvasContextMenu,
  ExportDialog,
  ModuleSession,
  ModuleToolbar,
  ModuleToolOptions,
  Rulers,
  useCanvasFile,
  useCopyAsPng,
} from "@canvas-ui";
import { LeftPanel } from "./components/left-panel";
import { PropertiesPanel } from "./components/properties-panel";
import { DesignRail } from "./components/rail";
import { CANVAS_INSET } from "./design-layout";

/**
 * The UI around the canvas: the rail and left panel, the properties panel, and over the canvas
 * the rulers, the toolbar, the context menu and the modules' overlays. Everything in it comes from the
 * modules' points; it never holds canvas content.
 */
export function DesignChrome() {
  const { name } = useCanvasFile();
  useCopyAsPng();

  return (
    <div className="pointer-events-none absolute inset-0">
      <ExportDialog name={name} />
      <div className="pointer-events-auto absolute inset-y-0 left-0 flex">
        <DesignRail />
        <LeftPanel />
      </div>
      <div className="pointer-events-auto absolute inset-y-0 right-0 flex">
        <PropertiesPanel />
      </div>
      {/* Laid over the canvas exactly, so screen positions from the engine line up. */}
      <div className="absolute inset-y-0" style={CANVAS_INSET}>
        <Rulers />
        <CollaboratorLayer />
        <CanvasContextMenu />
        <ModuleSession />
        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2">
          <ModuleToolOptions />
          <ModuleToolbar />
        </div>
      </div>
    </div>
  );
}
