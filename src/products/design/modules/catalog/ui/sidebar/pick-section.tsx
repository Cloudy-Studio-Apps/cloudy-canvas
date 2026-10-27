import { PanelSection } from "@design/ui/components/panel";
import { t } from "../../catalog.i18n";

/** What the sidebar says while frames are being picked. */
export function PickSection() {
  return (
    <PanelSection title={t("pick.title")}>
      <p className="text-xs text-muted-foreground">{t("pick.click")}</p>
      <p className="mt-2 text-xs text-muted-foreground">{t("pick.order")}</p>
    </PanelSection>
  );
}
