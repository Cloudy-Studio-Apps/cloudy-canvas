import { ZoomMenu } from "@canvas-ui";
import { EmptyState } from "@shared/ui/kit";
import { t } from "../../prototype.i18n";

/**
 * The properties panel in the Prototype mode (its `sidebar`): the mode's name and the zoom, then
 * what to select. The panels for a layer, a screen and a flow come with their editors.
 */
export function PrototypeSidebar() {
  return (
    <>
      <header className="flex h-11 shrink-0 items-center justify-between border-b px-3">
        <h2 className="text-xs font-semibold text-foreground">{t("sidebar.title")}</h2>
        <ZoomMenu side="bottom" />
      </header>
      <EmptyState title={t("sidebar.emptyTitle")} description={t("sidebar.empty")} />
    </>
  );
}
