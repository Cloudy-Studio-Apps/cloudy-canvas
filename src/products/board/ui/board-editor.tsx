import { useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

import { boardProduct } from "@board";
import { useCanvasEngine } from "@canvas-ui";
import { Button } from "@shared/ui/components/ui/button";
import { BoardSession } from "./board-session";
import { useBoardLoader } from "./file";
import type { BoardEditorProps } from "./board-editor.types";

export function BoardEditor({ id }: BoardEditorProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const load = useBoardLoader(id);
  const document = load.status === "ready" ? load.document : null;
  const engine = useCanvasEngine(containerRef, boardProduct, document);

  return (
    <div className="relative h-full overflow-hidden bg-background select-none">
      <div
        ref={containerRef}
        role="application"
        aria-label="Board canvas"
        className="absolute inset-0"
      />
      {engine && load.status === "ready" && (
        <BoardSession id={id} engine={engine} info={load.info} />
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
