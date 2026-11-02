import {
  CollaboratorLayer,
  CanvasContextMenu,
  ExportDialog,
  LiveSessionLayer,
  ModuleSlot,
  ModuleToolOptions,
  useCanvasFile,
  useCopyAs,
  useUiHidden,
  ZoomControls,
} from "@canvas-ui";

import { BoardToolbar } from "./components/board-toolbar";
import { BoardTopBar } from "./components/board-top-bar";
import { t } from "./board-ui.i18n";

/**
 * UI around the canvas. Never holds canvas content — it only reflects engine UI state. With the UI
 * hidden (Ctrl+\) only the cursors, the context menu and the export dialog stay; a live session's
 * viewer gets no toolbar.
 */
export function BoardChrome() {
  const { name, live } = useCanvasFile();
  const hidden = useUiHidden();
  const viewing = live?.role === "view";
  useCopyAs();
  return (
    <div className="pointer-events-none absolute inset-0">
      <CollaboratorLayer />
      <LiveSessionLayer />
      <CanvasContextMenu />
      <ExportDialog name={name} framePagesLabel={t("export.pagePerSection")} />
      {!hidden && (
        <>
          <div className="absolute top-3 left-3 max-sm:right-3">
            <BoardTopBar />
          </div>
          {!viewing && (
            <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 max-sm:px-3">
              <ModuleToolOptions />
              <BoardToolbar />
            </div>
          )}
          <div className="absolute top-3 right-3 bottom-16 flex flex-col">
            <ModuleSlot slot="sidePanels" />
          </div>
          {/* On a phone the toolbar takes the whole bottom, so zoom sits under the top bar. */}
          <div className="absolute right-3 bottom-4 max-sm:top-16 max-sm:bottom-auto">
            <ZoomControls />
          </div>
        </>
      )}
    </div>
  );
}
