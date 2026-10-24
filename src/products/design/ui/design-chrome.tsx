import {
  CollaboratorLayer,
  CanvasContextMenu,
  ExportDialog,
  LiveSessionLayer,
  ModuleSession,
  ModuleToolbar,
  ModuleToolOptions,
  Rulers,
  useCanvasFile,
  useCopyAsPng,
  useUiHidden,
} from "@canvas-ui";
import { LeftPanel } from "./components/left-panel";
import { PropertiesPanel, ShowPropertiesButton } from "./components/properties-panel";
import { DesignRail } from "./components/rail";
import { useCanvasInset } from "./hooks";
import { useDesignPanelStore } from "./stores/design-panel-store";

/**
 * The UI around the canvas: the rail and left panel, the properties panel, and over the canvas
 * the rulers, the toolbar, the context menu and the modules' overlays. Everything in it comes from the
 * modules' points; it never holds canvas content. Closed panels leave their space to the canvas, and
 * with the UI hidden (Ctrl+\) only the collaborators, the context menu and the overlays stay; a live
 * session's viewer gets no toolbar.
 */
export function DesignChrome() {
  const { name, live } = useCanvasFile();
  const viewing = live?.role === "view";
  const inset = useCanvasInset();
  const hidden = useUiHidden();
  const leftOpen = useDesignPanelStore((state) => state.leftOpen);
  const rightOpen = useDesignPanelStore((state) => state.rightOpen);
  useCopyAsPng();

  return (
    <div className="pointer-events-none absolute inset-0">
      <ExportDialog name={name} />
      <LiveSessionLayer />
      {!hidden && (
        <>
          <div className="pointer-events-auto absolute inset-y-0 left-0 flex">
            <DesignRail />
            {leftOpen && <LeftPanel />}
          </div>
          {rightOpen && (
            <div className="pointer-events-auto absolute inset-y-0 right-0 flex">
              <PropertiesPanel />
            </div>
          )}
        </>
      )}
      {/* Laid over the canvas exactly, so screen positions from the engine line up. */}
      <div className="absolute inset-y-0" style={inset}>
        {!hidden && <Rulers />}
        <CollaboratorLayer />
        <CanvasContextMenu />
        <ModuleSession />
        {!hidden && (
          <>
            {!rightOpen && <ShowPropertiesButton />}
            {!viewing && (
              <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2">
                <ModuleToolOptions />
                <ModuleToolbar />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
