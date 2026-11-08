import { ZoomMenu } from "@canvas-ui";
import { EmptyState } from "@shared/ui/kit";
import { t } from "../../prototype.i18n";
import { usePrototypeSelection } from "../hooks/use-prototype-selection";
import { LayerPanel } from "./layer-panel";

/**
 * The properties panel in the Prototype mode (its `sidebar`): the mode's name and the zoom, then
 * a selected layer's interactions, or what to select. The panels for a screen and a flow come
 * with their editors.
 */
export function PrototypeSidebar() {
  const selection = usePrototypeSelection();
  return (
    <>
      <header className="flex h-11 shrink-0 items-center justify-between border-b px-3">
        <h2 className="text-xs font-semibold text-foreground">{t("sidebar.title")}</h2>
        <ZoomMenu side="bottom" />
      </header>
      {selection.kind === "layer" ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <LayerPanel key={selection.id} id={selection.id} screen={selection.screen} />
        </div>
      ) : (
        <EmptyState title={t("sidebar.emptyTitle")} description={t("sidebar.empty")} />
      )}
    </>
  );
}
