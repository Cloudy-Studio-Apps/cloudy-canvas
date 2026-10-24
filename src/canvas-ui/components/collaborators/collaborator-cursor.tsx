import { CollaboratorAvatar } from "@shared/collaborators";
import { cn } from "@shared/ui/lib/utils";
import { useViewMapping } from "../../overlay";
import { pointToScreen } from "./to-screen";
import { useEasedPoint } from "./use-eased-point";
import type { CollaboratorCursorProps } from "./collaborator-cursor.types";

/** A collaborator's pointer on the canvas, with its avatar, name and what it's doing. */
export function CollaboratorCursor({ collaborator, at, idle }: CollaboratorCursorProps) {
  const view = useViewMapping();
  const world = useEasedPoint(at);
  const screen = pointToScreen(view, world);
  const { activity } = collaborator.state;

  return (
    <div
      className={cn("absolute top-0 left-0 transition-opacity", idle && "opacity-40")}
      style={{ transform: `translate(${screen.x}px, ${screen.y}px)` }}
    >
      <svg width="18" height="20" viewBox="0 0 18 20" className="drop-shadow-sm" aria-hidden>
        <path
          d="M1 1 L1 17 L5.5 12.8 L8.6 19 L11.4 17.6 L8.4 11.5 L14.5 11.5 Z"
          fill={collaborator.color}
          stroke="var(--surface)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <div
        className="ml-3 flex max-w-64 items-center gap-1.5 rounded-md border-2 bg-surface py-0.5 pr-2 pl-0.5 text-xs text-foreground shadow-md"
        style={{ borderColor: collaborator.color }}
      >
        <CollaboratorAvatar collaborator={{ ...collaborator, running: 0 }} className="border-0" />
        <span className="shrink-0 font-medium">{collaborator.name}</span>
        {activity && (
          <span
            className={cn(
              "truncate text-muted-foreground",
              activity.status === "running" && "animate-pulse",
              activity.status === "error" && "text-destructive",
            )}
          >
            {activity.label}
          </span>
        )}
      </div>
    </div>
  );
}
