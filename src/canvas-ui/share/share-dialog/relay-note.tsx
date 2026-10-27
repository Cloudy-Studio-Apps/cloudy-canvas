import { BUILT_IN_RELAY, RELAY_CHOICE_IN_SETTINGS } from "@shared/stores/built-in-relay";
import { useCollaborationStore } from "@shared/stores/collaboration-store";
import { useRelayStatusStore } from "@shared/stores/relay-status-store";
import { t } from "../share.i18n";

/** Which relay the session will go through, under Start sharing. */
export function RelayNote() {
  const relayChoice = useCollaborationStore((s) => s.relayChoice);
  const builtInDown = useRelayStatusStore((s) => s.builtInDownSince !== null);
  const builtIn = RELAY_CHOICE_IN_SETTINGS ? relayChoice === "builtin" : true;
  const relay =
    RELAY_CHOICE_IN_SETTINGS && relayChoice === "custom"
      ? t("relay.own")
      : builtIn && BUILT_IN_RELAY && !builtInDown
        ? t("relay.builtIn")
        : t("relay.public");

  return (
    <p className="text-xs text-muted-foreground">
      {t(RELAY_CHOICE_IN_SETTINGS ? "relay.noteSettings" : "relay.note", { relay })}
    </p>
  );
}
