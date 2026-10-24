import type { CSSProperties } from "react";

import { collaboratorTitle } from "@shared/core";
import { collaboratorIsIdle } from "@shared/stores/collaborators-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/components/ui/tooltip";
import { useNow } from "@shared/ui/hooks/use-now";
import { cn } from "@shared/ui/lib/utils";
import { CollaboratorAvatar } from "./collaborator-avatar";
import { CollaboratorOverflow } from "./collaborator-overflow";
import { collaboratorPlaceText, collaboratorStatusText } from "./collaborator-status-text";
import { useCollaborators } from "./use-collaborators";
import { useFollowToggle } from "./use-follow-toggle";
import type { CollaboratorStackProps } from "./collaborator-stack.types";

/** How often idle collaborators and "min ago" labels are worked out again. */
const TICK_MS = 5_000;

/**
 * The collaborators' avatars, as in Figma's top bar: overlapping circles, at most `max` of them
 * (the followed one always among them) and a "+N" button listing everyone. Hover one for what
 * it's doing and where; click one to follow its view (`followable`), click it again to stop.
 */
export function CollaboratorStack({
  followable = false,
  side = "bottom",
  max = 3,
  className,
}: CollaboratorStackProps) {
  const collaborators = useCollaborators();
  const { following, toggle } = useFollowToggle();
  const now = useNow(TICK_MS);
  if (collaborators.length === 0) return null;

  // With one too many, the last avatar shows instead of a "+1".
  const fits = collaborators.length <= max;
  let shown = fits ? collaborators : collaborators.slice(0, max - 1);
  const followed = collaborators.find((c) => c.id === following);
  if (followed && !shown.includes(followed)) shown = [...shown.slice(0, -1), followed];
  const hidden = collaborators.length - shown.length;

  return (
    <div className={cn("flex items-center -space-x-1.5", className)}>
      {shown.map((collaborator, i) => {
        const isFollowed = following === collaborator.id;
        const status = collaboratorStatusText(collaborator, now);
        const place = collaboratorPlaceText(collaborator);
        const title = collaboratorTitle(collaborator);
        const hint = isFollowed ? "Click to stop following" : "Click to follow";
        const avatar = (
          <CollaboratorAvatar
            collaborator={collaborator}
            idle={collaboratorIsIdle(collaborator, now)}
            followed={isFollowed}
            className="bg-surface ring-2 ring-surface"
          />
        );
        // The first is on top, so each one's activity dot shows over its neighbour.
        const layer = "relative z-(--layer) rounded-full hover:z-20";
        const order = { "--layer": isFollowed ? 10 : shown.length - i } as CSSProperties;
        return (
          <Tooltip key={collaborator.id}>
            <TooltipTrigger asChild>
              {followable ? (
                <button
                  type="button"
                  className={cn(
                    layer,
                    "focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  )}
                  style={order}
                  aria-pressed={isFollowed}
                  aria-label={`${title}: ${status}. ${hint}`}
                  onClick={() => toggle(collaborator.id)}
                >
                  {avatar}
                </button>
              ) : (
                <span
                  tabIndex={0}
                  className={layer}
                  style={order}
                  aria-label={`${title}: ${status}`}
                >
                  {avatar}
                </span>
              )}
            </TooltipTrigger>
            <TooltipContent side={side} className="flex max-w-64 flex-col items-start gap-0.5">
              <span className="font-medium">{title}</span>
              <span className="text-xs opacity-80">{status}</span>
              {place && <span className="text-xs opacity-80">{place}</span>}
              {followable && <span className="text-xs opacity-60">{hint}</span>}
            </TooltipContent>
          </Tooltip>
        );
      })}
      {hidden > 0 && <CollaboratorOverflow count={hidden} followable={followable} side={side} />}
    </div>
  );
}
