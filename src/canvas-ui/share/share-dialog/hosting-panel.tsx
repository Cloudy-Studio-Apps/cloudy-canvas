import { Copy, TriangleAlert } from "lucide-react";

import { clipboard } from "@platform";
import { notifyError, toast } from "@shared/stores/toast-store";
import { Button } from "@shared/ui/components/ui/button";
import { Input } from "@shared/ui/components/ui/input";
import { stopSharing } from "../host-session";
import { useStoreState } from "../use-store-state";
import { GuestRow } from "./guest-row";
import type { HostingPanelProps } from "./share-dialog.types";

/** While sharing: the link to send, the people in the session, and Stop sharing. */
export function HostingPanel({ host }: HostingPanelProps) {
  const { guests, knocks } = useStoreState(host.state);

  const copy = () =>
    void clipboard.writeText(host.link).then(
      () =>
        toast({ title: "Link copied", description: "Send it to the people you want to invite." }),
      (error: unknown) => notifyError("Couldn't copy the link", error),
    );

  return (
    <div className="grid gap-4 px-4 py-4">
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Invite link</p>
        <div className="flex gap-2">
          <Input
            value={host.link}
            readOnly
            className="font-mono text-xs"
            aria-label="Invite link"
          />
          <Button variant="outline" onClick={copy}>
            <Copy />
            Copy
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Whoever opens it asks to join; you decide who comes in.
        </p>
        {!host.online && (
          <p className="flex items-start gap-1.5 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            The relay couldn&apos;t be reached, so only people on your network can join. Check
            Settings › Collaboration.
          </p>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          In the session{guests.length > 0 ? ` (${guests.length})` : ""}
        </p>
        {guests.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {knocks.length > 0 ? "Someone is asking to join." : "Nobody has joined yet."}
          </p>
        ) : (
          <ul className="divide-y">
            {guests.map((guest) => (
              <GuestRow key={guest.peer} host={host} guest={guest} />
            ))}
          </ul>
        )}
      </div>
      <div className="flex justify-end border-t pt-3">
        <Button variant="outline" onClick={() => void stopSharing()}>
          Stop sharing
        </Button>
      </div>
    </div>
  );
}
