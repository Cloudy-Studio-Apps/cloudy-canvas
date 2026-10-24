import { BUILT_IN_RELAY, RELAY_CHOICE_IN_SETTINGS } from "@shared/stores/built-in-relay";
import { useCollaborationStore } from "@shared/stores/collaboration-store";
import { useRelayStatusStore } from "@shared/stores/relay-status-store";

/** Which relay the session will go through, under Start sharing. */
export function RelayNote() {
  const relayChoice = useCollaborationStore((s) => s.relayChoice);
  const builtInDown = useRelayStatusStore((s) => s.builtInDownSince !== null);
  const builtIn = RELAY_CHOICE_IN_SETTINGS ? relayChoice === "builtin" : true;
  const relay =
    RELAY_CHOICE_IN_SETTINGS && relayChoice === "custom"
      ? "your relay"
      : builtIn && BUILT_IN_RELAY && !builtInDown
        ? "the Cloudy Canvas relay"
        : "public relays";

  return (
    <p className="text-xs text-muted-foreground">
      Connections go through {relay} when a direct one can&apos;t be made
      {RELAY_CHOICE_IN_SETTINGS ? " (Settings › Collaboration)." : "."}
    </p>
  );
}
