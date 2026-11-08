import { t } from "../../prototype.i18n";
import type { PrototypeInteraction } from "../../model";
import { PROTOTYPE_TARGET_ACTIONS } from "../../prototype.constants";

/** An interaction in a line: "On click → Navigate to Menu". `screenName` names a screen by id. */
export function interactionSummary(
  ix: PrototypeInteraction,
  screenName: (id: string) => string,
): string {
  const action = t(`action.${ix.action}`);
  const target = PROTOTYPE_TARGET_ACTIONS.includes(ix.action) && ix.to ? screenName(ix.to) : "";
  return `${t(`trigger.${ix.trigger}`)} → ${[action, target].filter(Boolean).join(" ")}`;
}
