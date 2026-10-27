import { CircleAlert } from "lucide-react";

import { useRelayStatusStore } from "@shared/stores/relay-status-store";
import { t } from "../../settings.i18n";

/** Shown while sessions use n0's public relays because the Cloudy Canvas relay can't be reached. */
export function RelayDownNote() {
  const down = useRelayStatusStore((s) => s.builtInDownSince !== null);
  if (!down) return null;
  return (
    <p className="flex items-start gap-1.5 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      {t("collaboration.relayDown")}
    </p>
  );
}
