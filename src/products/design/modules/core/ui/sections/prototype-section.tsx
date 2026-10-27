import { PanelSection } from "@design/ui/components/panel";
import { t } from "../../core.i18n";

/** The Prototype tab, until interactions exist. */
export function PrototypeSection() {
  return (
    <PanelSection title={t("sections.interactions")}>
      <p className="text-xs text-muted-foreground">{t("sections.interactionsHint")}</p>
    </PanelSection>
  );
}
