import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { showPage } from "../page-actions";
import type { PageSectionProps } from "./sidebar.types";
import { t } from "../../catalog.i18n";

/** A page a repeat made: it follows its template page, which a button shows. */
export function GeneratedPageSection({ page }: PageSectionProps) {
  const engine = useDesignEngine();
  const { pages } = useBrochure();
  const from = page.slot.generated?.from;
  const template = pages.find((item) => item.slot.id === from)?.frame;
  return (
    <PanelSection title={t("repeat.copyTitle")}>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">{t("repeat.copyHint")}</p>
        {template && (
          <Button
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() => showPage(engine, template)}
          >
            {t("repeat.showTemplate")}
          </Button>
        )}
      </div>
    </PanelSection>
  );
}
