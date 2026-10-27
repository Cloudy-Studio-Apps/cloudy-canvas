import { useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

import { CanvasLoadingOverlay, useCanvasEngine, useCanvasFileDrop } from "@canvas-ui";
import { Button } from "@shared/ui/components/ui/button";
import { useFileDragOver } from "@shared/ui/hooks/use-file-drag-over";
import type { DesignEditorProps } from "./design-editor.types";
import { DesignSession } from "./design-session";
import { useDesignLoader } from "./file";
import { useCanvasInset, useKeepCanvasInPlace } from "./hooks";
import { getDesignProduct } from "./modules";
import { t } from "./design-ui.i18n";

/**
 * Loads a design and mounts the engine between the docked panels. The canvas container stays
 * where it is while the session (and its chrome) comes and goes, so the engine keeps its canvas.
 */
export function DesignEditor({ id, live }: DesignEditorProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const load = useDesignLoader(id, live ?? null);
  const document = load.status === "ready" ? load.document : null;
  const { engine, loading } = useCanvasEngine(containerRef, getDesignProduct(), document);
  const draggingFiles = useFileDragOver();
  useCanvasFileDrop(engine);
  const inset = useCanvasInset();
  useKeepCanvasInPlace(engine, inset.left);

  return (
    <div className="relative h-full overflow-hidden bg-surface select-none">
      <div
        ref={containerRef}
        role="application"
        aria-label={t("designEditor.ariaLabel")}
        data-product="design"
        className="absolute inset-y-0"
        style={inset}
      />
      {engine && load.status === "ready" && (
        <DesignSession id={id} engine={engine} info={load.info} live={live} />
      )}
      {engine && draggingFiles && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-40 border-2 border-primary"
          style={inset}
        />
      )}
      {!engine && load.status !== "error" && (
        <CanvasLoadingOverlay title={t("designEditor.title")} loading={loading} />
      )}
      {load.status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-lg font-semibold">{t("designEditor.failed")}</h1>
          <p className="max-w-md text-sm text-muted-foreground">{load.message}</p>
          <Button variant="outline" onClick={() => void navigate("/")}>
            <ArrowLeft />
            {t("designEditor.home")}
          </Button>
        </div>
      )}
    </div>
  );
}
