import { useEffect, useMemo, useState } from "react";

import { CollaboratorAvatar } from "@shared/collaborators";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { cn } from "@shared/ui/lib/utils";
import type { TabAvatarsProps } from "./title-bar.types";

/** An agent counts as working on a tab for this long after its last call. */
const AGENT_CALLING_MS = 2 * 60_000;
const MAX_SHOWN = 3;

/**
 * The collaborators and agents in a tab's file, as small avatars. An agent's avatar pulses while
 * an agent called the tab within the last 2 minutes and the tab isn't the one on screen.
 */
export function TabAvatars({ tab, active }: TabAvatarsProps) {
  const collaborators = useCollaboratorsStore((s) => s.collaborators);
  const here = useMemo(
    () => Object.values(collaborators).filter((c) => c.state.fileId === tab.fileId),
    [collaborators, tab.fileId],
  );
  const [now, setNow] = useState(() => Date.now());
  const lastCall = tab.lastAgentCallAt;
  useEffect(() => {
    if (lastCall === null) return;
    const timer = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => window.clearInterval(timer);
  }, [lastCall]);
  if (here.length === 0) return null;
  const calling = !active && lastCall !== null && now - lastCall < AGENT_CALLING_MS;
  const shown = here.slice(0, MAX_SHOWN);
  return (
    <span className="flex shrink-0 items-center -space-x-1.5">
      {shown.map((c) => (
        <CollaboratorAvatar
          key={c.id}
          collaborator={c}
          className={cn(
            "size-[18px] [&_svg]:size-2.5 [&>*]:size-full",
            calling && c.kind === "agent" && "animate-pulse",
          )}
        />
      ))}
      {here.length > shown.length && (
        <span className="ps-2 text-[10px] text-muted-foreground">
          +{here.length - shown.length}
        </span>
      )}
    </span>
  );
}
