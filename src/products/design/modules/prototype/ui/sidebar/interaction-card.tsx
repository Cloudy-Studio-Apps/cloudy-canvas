import { Hand, Keyboard, MousePointerClick, Timer, Trash2 } from "lucide-react";

import { IconButton } from "@shared/ui/kit";
import { PROTOTYPE_OVERLAY_ACTIONS } from "../../prototype.constants";
import { t } from "../../prototype.i18n";
import { ActionFields } from "./action-fields";
import { interactionSummary } from "./interaction-summary";
import { OverlayFields } from "./overlay-fields";
import { TransitionFields } from "./transition-fields";
import { TriggerFields } from "./trigger-fields";
import type { InteractionCardProps } from "./interaction-card.types";

const TRIGGER_ICONS = {
  click: MousePointerClick,
  hover: MousePointerClick,
  press: MousePointerClick,
  enter: MousePointerClick,
  leave: MousePointerClick,
  drag: Hand,
  key: Keyboard,
  delay: Timer,
} as const;

/** One interaction: its summary and a remove button, then its trigger, action and transition. */
export function InteractionCard({
  ix,
  screens,
  screenName,
  onChange,
  onRemove,
}: InteractionCardProps) {
  const Icon = TRIGGER_ICONS[ix.trigger];
  return (
    <div className="flex flex-col gap-2 rounded-card border bg-surface p-2">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
          {interactionSummary(ix, screenName)}
        </span>
        <IconButton size="xs" label={t("card.remove")} onClick={onRemove}>
          <Trash2 />
        </IconButton>
      </div>
      <TriggerFields ix={ix} onChange={onChange} />
      <ActionFields ix={ix} screens={screens} onChange={onChange} />
      {PROTOTYPE_OVERLAY_ACTIONS.includes(ix.action) && (
        <OverlayFields ix={ix} onChange={onChange} />
      )}
      {ix.action !== "link" && <TransitionFields ix={ix} onChange={onChange} />}
    </div>
  );
}
