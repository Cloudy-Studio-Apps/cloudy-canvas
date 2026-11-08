import { Plus } from "lucide-react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { PanelSection } from "@design/ui/components/panel";
import { useService } from "@canvas-ui";
import { IconButton } from "@shared/ui/kit";
import { DESIGN_PROTOTYPE, newInteraction, screenOf } from "../../model";
import type { PrototypeInteraction } from "../../model";
import { t } from "../../prototype.i18n";
import { usePrototypePage } from "../hooks/use-prototype-page";
import { editInteraction } from "./edit-interaction";
import { InteractionCard } from "./interaction-card";
import type { InteractionsSectionProps } from "./interactions-section.types";

/**
 * A node's interactions as cards, with a + to add one. Works for any node (a layer or a screen).
 * The "to" lists hold the page's screens except the owner's own; every change is one undo step.
 */
export function InteractionsSection({ owner }: InteractionsSectionProps) {
  const engine = useDesignEngine();
  const prototype = useService(DESIGN_PROTOTYPE);
  const { screens } = usePrototypePage();
  const list = prototype.interactions(owner);
  const own = screenOf(engine.doc, owner)?.id;
  const choices = screens
    .filter((screen) => screen.id !== own)
    .map((screen) => ({ value: screen.id, label: screen.name }));
  const screenName = (id: string) => screens.find((screen) => screen.id === id)?.name ?? "";

  // With no other screen only an action that needs none can be added.
  const add = () => {
    const first = choices[0];
    prototype.addInteraction(
      owner,
      first ? newInteraction(first.value) : editInteraction(newInteraction(), { action: "back" }),
    );
  };
  const change = (id: string, patch: Partial<PrototypeInteraction>) =>
    prototype.setInteractions(
      owner,
      list.map((ix) => (ix.id === id ? editInteraction(ix, patch) : ix)),
    );
  const remove = (id: string) =>
    prototype.setInteractions(
      owner,
      list.filter((ix) => ix.id !== id),
    );

  return (
    <PanelSection
      title={t("section.title")}
      actions={
        <IconButton size="xs" label={t("section.add")} onClick={add}>
          <Plus />
        </IconButton>
      }
    >
      <div className="flex flex-col gap-2">
        {list.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("section.empty")}</p>
        ) : (
          list.map((ix) => (
            <InteractionCard
              key={ix.id}
              ix={ix}
              screens={choices}
              screenName={screenName}
              onChange={(patch) => change(ix.id, patch)}
              onRemove={() => remove(ix.id)}
            />
          ))
        )}
      </div>
    </PanelSection>
  );
}
