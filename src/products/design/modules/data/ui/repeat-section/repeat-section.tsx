import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import { repeatOf, scopeAt } from "../../repeat";
import { useDataSources } from "../hooks/use-data-sources";
import { CardRepeat } from "./card-repeat";
import { ContainerRepeat } from "./container-repeat";
import { listNames } from "./list-names";
import { repeatTargets } from "./repeat-targets";
import { t } from "../../data.i18n";

/**
 * The selected layer's repeat: as a card in its parent frame ("Repeat this layer", or which
 * frame repeats it; only with a list to repeat, unless its frame repeats already), and, for a
 * frame, the card it repeats and the repeat's settings.
 */
export function RepeatSection({ selection: { nodes, elements } }: PropertySectionProps) {
  // Rows come from the sources: follow their Updates.
  useDataSources();
  const engine = useDesignEngine();
  const node = nodes[0];
  const targets = repeatTargets(node, elements);
  const { container } = targets;
  // A layer in a frame that doesn't repeat offers it only when there's a list to repeat.
  const card =
    targets.card &&
    (repeatOf(targets.card.frame) !== null ||
      listNames(scopeAt(engine.doc, targets.card.frame.id)).length > 0)
      ? targets.card
      : null;
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
