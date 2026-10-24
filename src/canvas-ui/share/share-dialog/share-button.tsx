import { useState } from "react";
import { Radio, Users } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { ToolButton } from "../../components/tool-button";
import { useCanvasFile } from "../../file";
import { useHostedSession } from "../host-session";
import { useStoreState } from "../use-store-state";
import { LiveBadge } from "./live-badge";
import { ShareDialog } from "./share-dialog";
import type { HostedCountProps, ShareButtonProps } from "./share-dialog.types";

/**
 * Opens the Share dialog; while the file is shared it says so (with how many have joined). In a
 * session joined as a guest it's a badge naming the host.
 */
export function ShareButton({ product, look }: ShareButtonProps) {
  const file = useCanvasFile();
  const host = useHostedSession(file.id);
  const [open, setOpen] = useState(false);
  if (file.live?.side === "guest") return <LiveBadge live={file.live} />;

  const trigger =
    look === "tool" ? (
      <ToolButton
        label={host ? "Sharing live" : "Share live"}
        side="bottom"
        className={host ? "text-primary" : undefined}
        onClick={() => setOpen(true)}
      >
        {host ? <Radio /> : <Users />}
      </ToolButton>
    ) : (
      <Button size="sm" variant={host ? "outline" : "default"} onClick={() => setOpen(true)}>
        {host ? <Radio /> : <Users />}
        {host ? "Live" : "Share"}
      </Button>
    );

  return (
    <>
      {trigger}
      {host && <HostedCount host={host} />}
      <ShareDialog open={open} onOpenChange={setOpen} product={product} />
    </>
  );
}

/** How many guests are in, beside the button. */
function HostedCount({ host }: HostedCountProps) {
  const { guests } = useStoreState(host.state);
  if (guests.length === 0) return null;
  return <span className="text-xs text-muted-foreground tabular-nums">{guests.length}</span>;
}
