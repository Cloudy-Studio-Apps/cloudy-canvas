import { CornerUpLeft, RotateCcw, Scan, X } from "lucide-react";

import { PanelDivider, ToolButton } from "@canvas-ui";
import { formatShortcut, tCommon } from "@shared/core";
import { Badge, SelectField } from "@shared/ui/kit";
import { deviceLabel } from "../sidebar/device-label";
import { PLAYER_KEYS } from "./player-keys";
import type { PlayerBarProps } from "./player-bar.types";
import { usePlayerStore } from "./player-store";
import { t } from "../../prototype.i18n";

/** The player's bar: the flow (switching plays another), its device, Back, Restart, hotspots, Close. */
export function PlayerBar({
  flow,
  flows,
  run,
  canGoBack,
  pinned,
  onToggleHints,
  onClose,
}: PlayerBarProps) {
  const open = usePlayerStore((state) => state.open);
  return (
    <header className="flex h-12 shrink-0 items-center gap-1.5 border-b bg-surface pr-2 pl-3">
      <SelectField
        label={t("player.flow")}
        value={flow.id}
        options={flows.map((candidate) => ({ value: candidate.id, label: candidate.name }))}
        onChange={(id) => open({ flow: id })}
        className="w-44"
      />
      <Badge variant="secondary">{deviceLabel(flow.device)}</Badge>
      <div className="flex-1" />
      <ToolButton
        label={t("player.back")}
        shortcut={formatShortcut(PLAYER_KEYS.back)}
        side="bottom"
        disabled={!canGoBack}
        onClick={() => run.back()}
      >
        <CornerUpLeft />
      </ToolButton>
      <ToolButton
        label={t("player.restart")}
        shortcut={formatShortcut(PLAYER_KEYS.restart)}
        side="bottom"
        onClick={() => run.restart()}
      >
        <RotateCcw />
      </ToolButton>
      <ToolButton
        label={t("player.hints")}
        shortcut={formatShortcut(PLAYER_KEYS.hints)}
        side="bottom"
        active={pinned}
        onClick={onToggleHints}
      >
        <Scan />
      </ToolButton>
      <PanelDivider className="h-5!" />
      <ToolButton
        label={tCommon("close")}
        shortcut={formatShortcut(PLAYER_KEYS.close)}
        side="bottom"
        onClick={onClose}
      >
        <X />
      </ToolButton>
    </header>
  );
}
