import { useMemo } from "react";

import type { CanvasElement } from "@canvas";
import { isDesignNode, withDescendants, type ImagePaint } from "@design";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useBrochure } from "../hooks/use-brochure";
import { PageImageRow } from "./page-image-row";
import type { PageImageRowProps, PageImagesSectionProps } from "./sidebar.types";

/** The pictures on a page (its layers' image fills), each with Replace. */
export function PageImagesSection({ frame }: PageImagesSectionProps) {
  const engine = useDesignEngine();
  const { version } = useBrochure();
  const images = useMemo(
    () => imagesIn(engine.doc.all(), frame.id),
    // The version reads them again when the document changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engine, frame.id, version],
  );

  return (
    <PanelSection title={`Images${images.length > 0 ? ` (${images.length})` : ""}`}>
      {images.length === 0 ? (
        <p className="text-xs text-muted-foreground">No pictures on this page.</p>
      ) : (
        <>
          <ul className="max-h-72 overflow-y-auto">
            {images.map(({ node, paint }) => (
              <PageImageRow key={`${node.id}:${paint.assetId}`} node={node} paint={paint} />
            ))}
          </ul>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Replace keeps the layer, its size and how the picture fills it.
          </p>
        </>
      )}
    </PanelSection>
  );
}

/** The image fills of the layers inside a frame. */
function imagesIn(elements: readonly CanvasElement[], frameId: string): PageImageRowProps[] {
  const nodes = elements.filter(isDesignNode);
  const inside = withDescendants(new Set([frameId]), nodes);
  return nodes.flatMap((node) =>
    inside.has(node.id)
      ? node.fills
          .filter((paint): paint is ImagePaint => paint.type === "image")
          .map((paint) => ({ node, paint }))
      : [],
  );
}
