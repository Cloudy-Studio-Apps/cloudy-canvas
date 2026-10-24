import { collaboratorIsIdle } from "@shared/stores/collaborators-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/components/ui/tooltip";
import { useNow } from "@shared/ui/hooks/use-now";
import { cn } from "@shared/ui/lib/utils";
import { CollaboratorAvatar } from "./collaborator-avatar";
import { collaboratorPlaceText, collaboratorStatusText } from "./collaborator-status-text";
import { useCollaborators } from "./use-collaborators";
import { useFollowToggle } from "./use-follow-toggle";
import type { CollaboratorStackProps } from "./collaborator-stack.types";

/** How often idle collaborators and "min ago" labels are worked out again. */
const TICK_MS = 5_000;

/**
 * The collaborators' avatars, as in Figma's top bar: hover one for what it's doing and where;
 * click one to follow its view (`followable`), click it again to stop.
 */
export function CollaboratorStack({
  followable = false,
  side = "bottom",
  className,
}: CollaboratorStackProps) {
  const collaborators = useCollaborators();
  const { following, toggle } = useFollowToggle();
  const now = useNow(TICK_MS);
  if (collaborators.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {collaborators.map((collaborator) => {
        const followed = following === collaborator.id;
        const status = collaboratorStatusText(collaborator, now);
        const place = collaboratorPlaceText(collaborator);
        const hint = followed ? "Click to stop following" : "Click to follow";
        const avatar = (
          <CollaboratorAvatar
            collaborator={collaborator}
            idle={collaboratorIsIdle(collaborator, now)}
            followed={followed}
          />
        );
        return (
          <Tooltip key={collaborator.id}>
            <TooltipTrigger asChild>
              {followable ? (
                <button
                  type="button"
                  className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-pressed={followed}
                  aria-label={`${collaborator.name}: ${status}. ${hint}`}
                  onClick={() => toggle(collaborator.id)}
                >
                  {avatar}
                </button>
              ) : (
                <span tabIndex={0} aria-label={`${collaborator.name}: ${status}`}>
                  {avatar}
                </span>
              )}
            </TooltipTrigger>
            <TooltipContent side={side} className="flex max-w-64 flex-col items-start gap-0.5">
              <span className="font-medium">{collaborator.name}</span>
              <span className="text-xs opacity-80">{status}</span>
              {place && <span className="text-xs opacity-80">{place}</span>}
              {followable && <span className="text-xs opacity-60">{hint}</span>}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
