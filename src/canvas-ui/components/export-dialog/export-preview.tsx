import { useEffect, useState } from "react";

import type { CanvasEngine, ExportArea } from "@canvas";
import { CHECKERBOARD } from "../color";
import { useEngine } from "../../engine-context";
import type { ExportPreviewProps } from "./export-dialog.types";
import { t } from "../components.i18n";

/** The preview's longest side, in pixels: sharp at the size the dialog shows it. */
const PREVIEW_SIDE = 800;
/** Lets small elements grow to `PREVIEW_SIDE` (`maxSide` brings big ones down). */
const PREVIEW_SCALE = 64;
/** Waits for typing in the margin field to settle before drawing again. */
const REDRAW_DELAY_MS = 150;

/**
 * A small picture of the first element the export holds, drawn as the file draws it, so the user
 * sees the margin and background before saving. A checkerboard shows through what's transparent.
 */
export function ExportPreview({ area, background, margin }: ExportPreviewProps) {
  const engine = useEngine();
  const [url, setUrl] = useState<string | null>(null);
  const id = firstExported(engine, area);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      engine
        .exportElements({
          format: "png",
          background,
          area: "board",
          ids: [id],
          padding: margin,
          scale: PREVIEW_SCALE,
          maxSide: PREVIEW_SIDE,
        })
        .then((blob) => {
          if (!cancelled) setUrl(URL.createObjectURL(blob));
        })
        // Nothing drawable (an empty group): no preview, the export itself reports it.
        .catch(() => !cancelled && setUrl(null));
    }, REDRAW_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [engine, id, background, margin]);

  // The old picture goes once the new one is shown, so the preview never flickers empty.
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);

  if (!id || !url) return null;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div className="relative min-h-48 flex-1 rounded-md border border-border">
        <img
          src={url}
          alt={t("export.preview")}
          // Centered and fitted inside the box, with its own proportions.
          className="absolute inset-0 m-auto max-h-[calc(100%-1rem)] max-w-[calc(100%-1rem)] outline outline-1 outline-primary/60"
          style={{ background: CHECKERBOARD }}
        />
      </div>
      <p className="text-center text-xs text-muted-foreground">{t("export.previewNote")}</p>
    </div>
  );
}

/** The first selected element, or the bottom-most top-level one for the whole canvas. */
function firstExported(engine: CanvasEngine, area: ExportArea): string | undefined {
  if (area === "selection") return engine.selectedIds()[0];
  return engine.elements().find((el) => engine.rootOf(el.id) === el.id)?.id;
}
