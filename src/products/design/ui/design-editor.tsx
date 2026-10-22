import { useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

import { CanvasLoadingOverlay, useCanvasEngine, useCanvasFileDrop } from "@canvas-ui";
import { Button } from "@shared/ui/components/ui/button";
import { useFileDragOver } from "@shared/ui/hooks/use-file-drag-over";
import { CANVAS_INSET } from "./design-layout";
import type { DesignEditorProps } from "./design-editor.types";
import { DesignSession } from "./design-session";
import { useDesignLoader } from "./file";
import { getDesignProduct } from "./modules";

/**
 * Loads a design and mounts the engine between the docked panels. The canvas container stays
 * where it is while the session (and its chrome) comes and goes, so the engine keeps its canvas.
 */
export function DesignEditor({ id }: DesignEditorProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const load = useDesignLoader(id);
  const document = load.status === "ready" ? load.document : null;
  const { engine, loading } = useCanvasEngine(containerRef, getDesignProduct(), document);
  const draggingFiles = useFileDragOver();
  useCanvasFileDrop(engine);

  return (
    <div className="relative h-full overflow-hidden bg-surface select-none">
      <div
        ref={containerRef}
        role="application"
        aria-label="Design canvas"
        data-product="design"
        className="absolute inset-y-0"
        style={CANVAS_INSET}
      />
      {engine && load.status === "ready" && (
        <DesignSession id={id} engine={engine} info={load.info} />
      )}
      {engine && draggingFiles && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-40 border-2 border-primary"
          style={CANVAS_INSET}
        />
      )}
      {!engine && load.status !== "error" && (
        <CanvasLoadingOverlay title="Opening design" loading={loading} />
      )}
      {load.status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-lg font-semibold">The design couldn't be opened</h1>
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
