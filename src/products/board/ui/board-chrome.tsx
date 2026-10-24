import {
  CollaboratorLayer,
  CanvasContextMenu,
  ExportDialog,
  ModuleSlot,
  ModuleToolOptions,
  useCanvasFile,
  useCopyAsPng,
  useUiHidden,
  ZoomControls,
} from "@canvas-ui";

import { BoardToolbar } from "./components/board-toolbar";
import { BoardTopBar } from "./components/board-top-bar";

/**
 * UI around the canvas. Never holds canvas content — it only reflects engine UI state. With the UI
 * hidden (Ctrl+\) only the cursors, the context menu and the export dialog stay.
 */
export function BoardChrome() {
  const { name } = useCanvasFile();
  const hidden = useUiHidden();
  useCopyAsPng();
  return (
    <div className="pointer-events-none absolute inset-0">
      <CollaboratorLayer />
      <CanvasContextMenu />
      <ExportDialog name={name} />
      {!hidden && (
        <>
          <div className="absolute top-3 left-3">
            <BoardTopBar />
          </div>
          <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2">
            <ModuleToolOptions />
            <BoardToolbar />
          </div>
          <div className="absolute top-3 right-3 bottom-16 flex flex-col">
            <ModuleSlot slot="sidePanels" />
          </div>
          <div className="absolute right-3 bottom-4">
            <ZoomControls />
          </div>
        </>
      )}
    </div>
  );
}
