import { PanelSection } from "@design/ui/components/panel";
import type { PropertySectionProps } from "@design/ui/modules";
import { useDataSources } from "../hooks/use-data-sources";
import { CardRepeat } from "./card-repeat";
import { ContainerRepeat } from "./container-repeat";
import { repeatTargets } from "./repeat-targets";
import { t } from "../../data.i18n";

/**
 * The selected layer's repeat: as a card in its parent frame ("Repeat this layer", or which
 * frame repeats it), and, for a frame, the card it repeats and the repeat's settings.
 */
export function RepeatSection({ selection: { nodes, elements } }: PropertySectionProps) {
  // Rows come from the sources: follow their Updates.
  useDataSources();
  const node = nodes[0];
  const { card, container } = repeatTargets(node, elements);
  if (!node || (!card && !container)) return null;
  return (
    <PanelSection title={t("repeat.title")}>
      <div className="flex flex-col gap-3">
        {card && <CardRepeat node={node} frame={card.frame} layers={card.layers} />}
        {container && <ContainerRepeat frame={container.frame} layers={container.layers} />}
      </div>
    </PanelSection>
  );
}
