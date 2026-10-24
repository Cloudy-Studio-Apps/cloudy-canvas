import { CircleAlert } from "lucide-react";

import { useRelayStatusStore } from "@shared/stores/relay-status-store";

/** Shown while sessions use n0's public relays because the Cloudy Canvas relay can't be reached. */
export function RelayDownNote() {
  const down = useRelayStatusStore((s) => s.builtInDownSince !== null);
  if (!down) return null;
  return (
    <p className="flex items-start gap-1.5 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      The Cloudy Canvas relay can&apos;t be reached right now because of a technical problem, so
      sessions use public relays (n0) instead. They work the same and stay end-to-end encrypted. The
      Cloudy Canvas relay is tried again for later sessions.
    </p>
  );
}
