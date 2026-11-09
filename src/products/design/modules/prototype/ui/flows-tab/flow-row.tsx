import { Play } from "lucide-react";

import { IconButton, ListRow } from "@shared/ui/kit";
import { usePlayerStore } from "../player/player-store";
import { PLATFORM_ICONS } from "./platform-icons";
import type { FlowRowProps } from "./flow-row.types";
import { t } from "../../prototype.i18n";

/** A flow in the Flows tab: its platform, name and where it starts; ▶ plays it. */
export function FlowRow({ flow, screens, selected, onSelect }: FlowRowProps) {
  const open = usePlayerStore((state) => state.open);
  const Icon = PLATFORM_ICONS[flow.platform];
  const start = screens.find((screen) => screen.id === flow.start)?.name ?? "";
  return (
    <ListRow
      size="md"
      icon={<Icon />}
      selected={selected}
      onSelect={onSelect}
      label={
        <span className="flex min-w-0 flex-col">
          <span className="truncate">{flow.name}</span>
          <span className="truncate text-[11px] text-muted-foreground">
            {t("flows.startsAt", { platform: t(`platform.${flow.platform}`), screen: start })}
          </span>
        </span>
      }
      actions={
        <IconButton
          size="xs"
          label={t("flows.play", { name: flow.name })}
          onClick={() => open({ flow: flow.id })}
        >
          <Play />
        </IconButton>
      }
    />
  );
}
