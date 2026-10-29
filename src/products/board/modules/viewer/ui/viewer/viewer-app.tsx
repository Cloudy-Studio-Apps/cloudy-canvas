import { useCallback, useMemo, useRef, useState } from "react";

import type { CanvasElement } from "@canvas";
import { t } from "../../viewer.i18n";
import type { ViewerPart } from "../viewer-part.types";
import { BrandBar } from "./brand-bar";
import type { BrandBarToggle } from "./brand-bar.types";
import { useViewerClicks } from "./use-viewer-clicks";
import { useViewerEngine } from "./use-viewer-engine";
import type { OpenPanel, ViewerAppProps } from "./viewer-app.types";
import { ViewerError } from "./viewer-error";
import { ViewerPanelHost } from "./viewer-panel-host";
import { ZoomBar } from "./zoom-bar";

/**
 * An exported board: the canvas filling the window, read-only and moved with the hand, with the
 * brand bar (title, the parts' toggles), the zoom bar and one part's side panel at a time.
 */
export function ViewerApp({ file, product, document, fonts, parts }: ViewerAppProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { engine, failed } = useViewerEngine(containerRef, { product, document, fonts });
  const [open, setOpen] = useState<OpenPanel | null>(null);

  // A panel needs what its part collected; a click of its own works without.
  const reachable = useMemo(
    () => parts.filter((part) => part.click ?? (part.panel && part.id in file.parts)),
    [parts, file.parts],
  );
  const onClick = useCallback((part: ViewerPart, element: CanvasElement) => {
    if (part.click) part.click(element);
    else setOpen({ part, element });
  }, []);
  useViewerClicks(containerRef, { engine, parts: reachable, onClick });

  const toggles: BrandBarToggle[] = reachable
    .flatMap((part) => (part.button && part.panel ? [{ part, button: part.button }] : []))
    .sort((a, b) => a.button.order - b.button.order)
    .map(({ part, button }) => ({
      id: part.id,
      button,
      active: open?.part.id === part.id,
      onToggle: () =>
        setOpen((current) => (current?.part.id === part.id ? null : { part, element: null })),
    }));

  if (failed) return <ViewerError message={t("error.webgl")} />;
  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0">
        <BrandBar meta={file.meta} toggles={toggles} />
        {engine && <ZoomBar engine={engine} />}
        {open && (
          <ViewerPanelHost
            key={`${open.part.id}:${open.element?.id ?? ""}`}
            open={open}
            data={file.parts[open.part.id]}
            onClose={() => setOpen(null)}
          />
        )}
      </div>
    </div>
  );
}
