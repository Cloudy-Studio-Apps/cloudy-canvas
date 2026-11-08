import { Plus } from "lucide-react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { IconButton, Section } from "@shared/ui/kit";
import { addFlowAt, selectedScreenId } from "../add-flow";
import { usePrototypePage } from "../hooks/use-prototype-page";
import { usePrototypeSelection } from "../hooks/use-prototype-selection";
import { usePrototypeViewStore } from "../stores/prototype-view-store";
import { FlowRow } from "./flow-row";
import { t } from "../../prototype.i18n";

/**
 * The Prototype mode's left tab: the page's flows, each with its platform and starting screen.
 * A click picks one (its settings show on the right); "+" adds one at the selected screen, else
 * at the page's first screen.
 */
export function FlowsTab() {
  const engine = useDesignEngine();
  const { flows, screens } = usePrototypePage();
  const selection = usePrototypeSelection();
  const selectFlow = usePrototypeViewStore((state) => state.selectFlow);
  const add = () => {
    const start = selectedScreenId(engine) ?? screens[0]?.id;
    if (start) addFlowAt(engine, start);
  };
  const pick = (id: string) => {
    engine.select([]);
    selectFlow(id);
  };
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <Section
        title={t("flows.title")}
        actions={
          <IconButton
            size="xs"
            label={t("flows.add")}
            disabled={screens.length === 0}
            onClick={add}
          >
            <Plus />
          </IconButton>
        }
      >
        <div className="flex flex-col">
          {flows.map((flow) => (
            <FlowRow
              key={flow.id}
              flow={flow}
              screens={screens}
              selected={selection.kind === "flow" && selection.id === flow.id}
              onSelect={() => pick(flow.id)}
            />
          ))}
        </div>
      </Section>
      <p className="px-3 pb-3 text-xs text-muted-foreground">{t("flows.hint")}</p>
    </div>
  );
}
