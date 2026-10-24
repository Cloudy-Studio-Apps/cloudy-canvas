import { useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

import { CanvasLoadingOverlay, useCanvasEngine, useCanvasFileDrop } from "@canvas-ui";
import { Button } from "@shared/ui/components/ui/button";
import { useFileDragOver } from "@shared/ui/hooks/use-file-drag-over";
import { BoardSession } from "./board-session";
import { useBoardLoader } from "./file";
import { getBoardProduct } from "./modules";
import type { BoardEditorProps } from "./board-editor.types";

export function BoardEditor({ id, live }: BoardEditorProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const load = useBoardLoader(id, live ?? null);
  const document = load.status === "ready" ? load.document : null;
  const { engine, loading } = useCanvasEngine(containerRef, getBoardProduct(), document);
  const draggingFiles = useFileDragOver();
  useCanvasFileDrop(engine);

  return (
    <div className="relative h-full overflow-hidden bg-background select-none">
      <div
        ref={containerRef}
        role="application"
        aria-label="Board canvas"
        className="absolute inset-0"
      />
      {engine && load.status === "ready" && (
        <BoardSession id={id} engine={engine} info={load.info} live={live} />
      )}
      {engine && draggingFiles && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-40 border-2 border-primary"
        />
      )}
      {!engine && load.status !== "error" && (
        <CanvasLoadingOverlay title="Opening board" loading={loading} />
      )}
      {load.status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-lg font-semibold">The board couldn't be opened</h1>
          <p className="max-w-md text-sm text-muted-foreground">{load.message}</p>
          <Button variant="outline" onClick={() => void navigate("/")}>
            <ArrowLeft />
            Back to home
          </Button>
        </div>
      )}
    </div>
  );
}
