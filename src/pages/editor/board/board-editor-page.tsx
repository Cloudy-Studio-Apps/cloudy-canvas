import { useRef } from "react";

import type { CanvasEngine } from "@engine";
import { BoardToolbar } from "./components/board-toolbar";
import { BoardTopBar } from "./components/board-top-bar";
import { ToolOptions } from "./components/tool-options";
import { ZoomControls } from "./components/zoom-controls";
import { useCanvasEngine, useEngineState } from "./use-canvas-engine";

// TODO: Load/save the board's Yjs document through Storage (keyed by the :id route param).
export function BoardEditorPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engine = useCanvasEngine(containerRef);

  return (
    <div className="relative h-full overflow-hidden bg-background select-none">
      <div
        ref={containerRef}
        role="application"
        aria-label="Board canvas"
        className="absolute inset-0"
      />
      {engine && <BoardChrome engine={engine} />}
    </div>
  );
}

/** UI around the canvas. Never holds canvas content — it only reflects engine UI state. */
function BoardChrome({ engine }: { engine: CanvasEngine }) {
  const state = useEngineState(engine);

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute top-3 left-3">
        <BoardTopBar engine={engine} state={state} />
      </div>
      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2">
        <ToolOptions engine={engine} state={state} />
        <BoardToolbar engine={engine} state={state} />
      </div>
      <div className="absolute right-3 bottom-4">
        <ZoomControls engine={engine} state={state} />
      </div>
    </div>
  );
}
