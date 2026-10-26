import { useMemo } from "react";

import { isPlaceholderPaint } from "../../../core";
import { pagePictures } from "../../model/page-pictures";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useBrochure } from "../hooks/use-brochure";
import { PageImageRow } from "./page-image-row";
import type { PageImagesSectionProps } from "./sidebar.types";

/** The pictures on a page (its layers' image fills), each with Replace. */
export function PageImagesSection({ frame }: PageImagesSectionProps) {
  const engine = useDesignEngine();
  const { version } = useBrochure();
  const images = useMemo(
    () => pagePictures(engine.doc.all(), frame.id),
    // The version reads them again when the document changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engine, frame.id, version],
  );

  const placeholders = images.filter(({ paint }) => isPlaceholderPaint(paint)).length;
  const count =
    images.length === 0
      ? ""
      : ` (${images.length}${placeholders > 0 ? ` · ${placeholders} to replace` : ""})`;

  return (
    <PanelSection title={`Images${count}`}>
      {images.length === 0 ? (
        <p className="text-xs text-muted-foreground">No pictures on this page.</p>
      ) : (
        <>
          <ul className="max-h-72 overflow-y-auto">
            {images.map((picture) => (
              <PageImageRow key={`${picture.node.id}:${picture.fill}`} picture={picture} />
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
