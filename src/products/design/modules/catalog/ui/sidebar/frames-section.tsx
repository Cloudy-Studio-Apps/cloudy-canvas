import { readingOrder } from "@canvas";
import { ensureBrochure } from "../../model/current-brochure";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { selectedSlots } from "../../model/selected-slots";
import { PageMasterField } from "./page-master-field";
import type { FramesSectionProps } from "./sidebar.types";
import { t } from "../../catalog.i18n";

/**
 * Several frames selected: add the ones not in the brochure as pages, in reading order; when
 * they're all pages, pick the master they show.
 */
export function FramesSection({ frames }: FramesSectionProps) {
  const engine = useDesignEngine();
  const { brochure, pages } = useBrochure();
  const loose = frames.filter((frame) => !brochure?.pageOf(frame.id));
  const ordered = readingOrder(loose.map((frame) => ({ id: frame.id, rect: frame })));

  const slots = selectedSlots(
    pages,
    frames.map((frame) => frame.id),
  );

  return (
    <PanelSection title={t("frames.title", { count: frames.length })}>
      {loose.length === 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">{t("frames.all")}</p>
          <PageMasterField slotIds={slots} />
        </div>
      ) : (
        <Button
          size="sm"
          className="w-full"
          onClick={() => ensureBrochure(engine).addPages(ordered.map((item) => item.id))}
        >
          {t("frames.addAsPages", { count: loose.length })}
        </Button>
      )}
      <p className="mt-1.5 text-xs text-muted-foreground">{t("frames.newPagesHint")}</p>
    </PanelSection>
  );
}
