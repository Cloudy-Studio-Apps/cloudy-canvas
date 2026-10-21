import { BoardToolbar } from "./components/board-toolbar";
import { DbPanel } from "./components/db-panel";
import { ErPanel } from "./components/er-panel";
import { BoardTopBar } from "./components/board-top-bar";
import { ToolOptions } from "./components/tool-options/tool-options";
import { ZoomControls } from "./components/zoom-controls";

/** UI around the canvas. Never holds canvas content — it only reflects engine UI state. */
export function BoardChrome() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute top-3 left-3">
        <BoardTopBar />
      </div>
      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2">
        <ToolOptions />
        <BoardToolbar />
      </div>
      <div className="absolute top-3 right-3 bottom-16 flex flex-col">
        <DbPanel />
        <ErPanel />
      </div>
      <div className="absolute right-3 bottom-4">
        <ZoomControls />
      </div>
    </div>
  );
}
