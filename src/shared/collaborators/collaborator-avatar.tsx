// Deep imports: the agent server menu imports this folder, so its barrel would be a cycle.
import { AgentClientIconView } from "@shared/agent-server/agent-client-icon";
import { agentClient } from "@shared/agent-server/identify-agent";
import { cn } from "@shared/ui/lib/utils";
import type { CollaboratorAvatarProps } from "./collaborator-avatar.types";

/**
 * A collaborator's avatar, round as in Figma: an agent's app logo or a person's initials, ringed in
 * its colour.
 * It pulses while it works, fades when idle and gets a second ring while the user follows it.
 */
export function CollaboratorAvatar({
  collaborator,
  idle = false,
  followed = false,
  className,
}: CollaboratorAvatarProps) {
  const { avatar, color, running } = collaborator;
  return (
    <span
      className={cn(
        "relative flex shrink-0 rounded-full border-2 transition-opacity",
        idle && !followed && "opacity-50",
        followed && "outline-2 outline-offset-2",
        className,
      )}
      style={{ borderColor: color, outlineColor: color }}
    >
      {avatar.type === "agent" ? (
        <AgentClientIconView
          icon={agentClient(avatar.clientId).icon}
          className="size-6 rounded-full border-0 [&_svg]:size-3.5"
        />
      ) : (
        <span className="flex size-6 items-center justify-center rounded-full bg-surface text-[10px] font-semibold text-foreground">
          {avatar.text}
        </span>
      )}
      {running > 0 && (
        <span
          className="absolute -right-1 -bottom-1 size-2.5 animate-pulse rounded-full border border-surface"
          style={{ background: color }}
        />
      )}
    </span>
  );
}
