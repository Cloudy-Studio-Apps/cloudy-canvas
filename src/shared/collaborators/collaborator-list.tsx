import { collaboratorTitle } from "@shared/core";
import { collaboratorIsIdle } from "@shared/stores/collaborators-store";
import { DropdownMenuItem, DropdownMenuLabel } from "@shared/ui/components/ui/dropdown-menu";
import { useNow } from "@shared/ui/hooks/use-now";
import { CollaboratorAvatar } from "./collaborator-avatar";
import { collaboratorPlaceText, collaboratorStatusText } from "./collaborator-status-text";
import { useCollaborators } from "./use-collaborators";
import { useFollowToggle } from "./use-follow-toggle";
import type { CollaboratorListProps } from "./collaborator-list.types";

const TICK_MS = 5_000;

/** A menu's list of collaborators: what each one does and where; picking one follows it. */
export function CollaboratorList({
  kind,
  source,
  followable = false,
  actions,
}: CollaboratorListProps) {
  const collaborators = useCollaborators(kind, source);
  const { following, toggle } = useFollowToggle();
  const now = useNow(TICK_MS);

  return (
    <>
      <DropdownMenuLabel>
        Connected {kind === "agent" ? "agents" : "collaborators"}
      </DropdownMenuLabel>
      {collaborators.length === 0 ? (
        <p className="px-2 pb-2 text-xs text-muted-foreground">No one has connected yet.</p>
      ) : (
        collaborators.map((collaborator) => {
          const followed = following === collaborator.id;
          const place = collaboratorPlaceText(collaborator);
          return (
            <div key={collaborator.id} className="flex items-center gap-1">
              <DropdownMenuItem
                className="min-w-0 flex-1"
                disabled={!followable}
                onSelect={() => toggle(collaborator.id)}
              >
                <CollaboratorAvatar
                  collaborator={collaborator}
                  idle={collaboratorIsIdle(collaborator, now)}
                  followed={followed}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1.5 truncate text-sm">
                    {collaboratorTitle(collaborator)}
                    {followed && <span className="text-xs text-primary">Following</span>}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {collaboratorStatusText(collaborator, now)}
                    {place && ` · ${place}`}
                  </span>
                </span>
              </DropdownMenuItem>
              {actions?.(collaborator)}
            </div>
          );
        })
      )}
    </>
  );
}
