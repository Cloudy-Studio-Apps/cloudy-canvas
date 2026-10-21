import { ZoomControls } from "@canvas-ui";

import { BoardToolbar } from "./components/board-toolbar";
import { BoardTopBar } from "./components/board-top-bar";
import { ToolOptions } from "./components/tool-options/tool-options";

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
      <div className="absolute right-3 bottom-4">
        <ZoomControls />
      </div>
    </div>
  );
}
