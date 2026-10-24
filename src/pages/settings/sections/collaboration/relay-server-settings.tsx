import { useId } from "react";
import { CircleCheck, CircleAlert, LoaderCircle } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import { useCollaborationStore } from "@shared/stores/collaboration-store";
import type { RelayChoice } from "@shared/stores/collaboration-store.types";
import { Button } from "@shared/ui/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@shared/ui/components/ui/radio-group";
import { useRelayTest } from "./use-relay-test";

/** Which relay hosted sessions go through: n0's public ones or the user's own server. */
export function RelayServerSettings() {
  const choice = useCollaborationStore((s) => s.relayChoice);
  const relay = useCollaborationStore((s) => s.customRelay);
  const setChoice = useCollaborationStore((s) => s.setRelayChoice);
  const setRelay = useCollaborationStore((s) => s.setCustomRelay);
  const { state, test, reset } = useRelayTest();
  const urlId = useId();
  const tokenId = useId();

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
        <label className="flex items-center gap-2 text-sm">
          <RadioGroupItem value="public" />
          Public relays (n0)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <RadioGroupItem value="custom" />
          My relay
        </label>
      </RadioGroup>
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
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={!relay.url || state.status === "testing"}
              onClick={() => void test(relay)}
            >
              {state.status === "testing" && <LoaderCircle className="animate-spin" />}
              Test connection
            </Button>
            {state.status === "ok" && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CircleCheck className="size-4 text-success" />
                Connected through the relay in {state.millis} ms
              </span>
            )}
          </div>
          {state.status === "failed" && (
            <p className="flex items-start gap-1.5 text-sm text-destructive">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              {state.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
