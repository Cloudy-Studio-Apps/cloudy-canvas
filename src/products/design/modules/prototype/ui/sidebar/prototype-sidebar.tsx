import { ZoomMenu } from "@canvas-ui";
import { t } from "../../prototype.i18n";
import { usePrototypeSelection } from "../hooks/use-prototype-selection";
import { EmptyPanel } from "./empty-panel";
import { FlowPanel } from "./flow-panel";
import { LayerPanel } from "./layer-panel";
import { ScreenPanel } from "./screen-panel";

/**
 * The properties panel in the Prototype mode (its `sidebar`): the mode's name and the zoom, then
 * the panel of what's selected: a layer, a screen, a flow, or (nothing) what to select and which
 * links to show.
 */
export function PrototypeSidebar() {
  const selection = usePrototypeSelection();
  return (
    <>
      <header className="flex h-11 shrink-0 items-center justify-between border-b px-3">
        <h2 className="text-xs font-semibold text-foreground">{t("sidebar.title")}</h2>
        <ZoomMenu side="bottom" />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {selection.kind === "layer" ? (
          <LayerPanel key={selection.id} id={selection.id} screen={selection.screen} />
        ) : selection.kind === "screen" ? (
          <ScreenPanel key={selection.id} id={selection.id} />
        ) : selection.kind === "flow" ? (
          <FlowPanel key={selection.id} id={selection.id} />
        ) : (
          <EmptyPanel />
        )}
      </div>
    </>
  );
}
