import { useRef } from "react";

import { BoardChrome } from "./board-chrome";
import { EngineContext } from "./engine/engine-context";
import { useCanvasEngine } from "./engine/use-canvas-engine";

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
      {engine && (
        <EngineContext value={engine}>
          <BoardChrome />
        </EngineContext>
      )}
    </div>
  );
}
