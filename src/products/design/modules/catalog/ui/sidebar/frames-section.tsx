import { readingOrder } from "@canvas";
import { ensureBrochure } from "../../model/current-brochure";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import type { FramesSectionProps } from "./sidebar.types";
import { t } from "../../catalog.i18n";

/** Several frames selected: add the ones not in the brochure as pages, in reading order. */
export function FramesSection({ frames }: FramesSectionProps) {
  const engine = useDesignEngine();
  const { brochure } = useBrochure();
  const loose = frames.filter((frame) => !brochure?.pageOf(frame.id));
  const ordered = readingOrder(loose.map((frame) => ({ id: frame.id, rect: frame })));

  return (
    <PanelSection title={t("frames.title", { count: frames.length })}>
      {loose.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("frames.all")}</p>
      ) : (
        <Button
          size="sm"
          className="w-full"
          onClick={() => ensureBrochure(engine).addPages(ordered.map((item) => item.id))}
        >
          Add {loose.length} as pages
        </Button>
      )}
      <p className="mt-1.5 text-xs text-muted-foreground">
        New pages go at the end, in reading order (rows, left to right).
      </p>
    </PanelSection>
  );
}
