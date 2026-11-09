import { UserPlus } from "lucide-react";
import { useSyncExternalStore } from "react";

import { sharingState } from "@canvas-ui/share/sharing-state";
import { t } from "./title-bar.i18n";
import type { TabKnockBadgeProps } from "./title-bar.types";

/** On the tab of the file this app shares, while someone is asking to join it. */
export function TabKnockBadge({ tab }: TabKnockBadgeProps) {
  const knocking = useSyncExternalStore(
    sharingState.subscribe,
    () => tab.hosting && sharingState.knocks() > 0,
  );
  if (!knocking) return null;
  return (
    <UserPlus
      role="img"
      aria-label={t("knocking")}
      className="size-3.5 shrink-0 animate-pulse text-primary"
    />
  );
}
