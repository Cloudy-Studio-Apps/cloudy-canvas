import { useId } from "react";

import { CommitInput } from "@canvas-ui";
import { BUILT_IN_RELAY } from "@shared/stores/built-in-relay";
import { useCollaborationStore } from "@shared/stores/collaboration-store";
import type { RelayChoice } from "@shared/stores/collaboration-store.types";
import { RadioGroup, RadioGroupItem } from "@shared/ui/components/ui/radio-group";
import { RelayDownNote } from "./relay-down-note";
import { RelayTestRow } from "./relay-test-row";
import { useRelayTest } from "./use-relay-test";

/**
 * Which relay hosted sessions go through: the one the app was built with (when it was), n0's
 * public ones or the user's own server.
 */
export function RelayServerSettings() {
  const storedChoice = useCollaborationStore((s) => s.relayChoice);
  const relay = useCollaborationStore((s) => s.customRelay);
  const setChoice = useCollaborationStore((s) => s.setRelayChoice);
  const setRelay = useCollaborationStore((s) => s.setCustomRelay);
  const { state, test, reset } = useRelayTest();
  const urlId = useId();
  const tokenId = useId();
  // A choice saved by a build with a relay, read by one without: the public ones are used.
  const choice = storedChoice === "builtin" && !BUILT_IN_RELAY ? "public" : storedChoice;

  const commitUrl = (url: string) => {
    const trimmed = url.trim();
    if (trimmed && !/^https?:\/\/[^/\s]+/.test(trimmed))
      return "Enter the relay's address, like https://relay.example.com";
    setRelay({ ...relay, url: trimmed });
    reset();
  };
  const commitToken = (token: string) => {
    setRelay({ ...relay, token: token.trim() || null });
    reset();
  };

  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">Relay server</p>
        <p className="text-sm text-muted-foreground">
          Helps guests reach you through routers, and carries the session when a direct connection
          can&apos;t be made. It never sees your files. Guests use the one in your link.
        </p>
      </div>
      <RadioGroup
        value={choice}
        onValueChange={(value) => {
          setChoice(value as RelayChoice);
          reset();
        }}
      >
        {BUILT_IN_RELAY && (
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="builtin" />
            Cloudy Canvas relay
          </label>
        )}
        <label className="flex items-center gap-2 text-sm">
          <RadioGroupItem value="public" />
          Public relays (n0)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <RadioGroupItem value="custom" />
          My relay
        </label>
      </RadioGroup>
      {choice === "builtin" && (
        <div className="space-y-3 border-l-2 pl-4">
          <RelayDownNote />
          <RelayTestRow relay={BUILT_IN_RELAY} state={state} onTest={(r) => void test(r)} />
        </div>
      )}
      {choice === "custom" && (
        <div className="space-y-3 border-l-2 pl-4">
          <div className="space-y-1">
            <label htmlFor={urlId} className="text-sm">
              Address
            </label>
            <CommitInput
              id={urlId}
              value={relay.url}
              onCommit={commitUrl}
              placeholder="https://relay.example.com"
              spellCheck={false}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor={tokenId} className="text-sm">
              Access token
            </label>
            <CommitInput
              id={tokenId}
              value={relay.token ?? ""}
              onCommit={commitToken}
              placeholder="IROH_RELAY_ACCESS_TOKEN from the server's .env"
              spellCheck={false}
              className="font-mono"
            />
          </div>
          <RelayTestRow
            relay={relay.url ? relay : null}
            state={state}
            onTest={(r) => void test(r)}
          />
        </div>
      )}
    </div>
  );
}
