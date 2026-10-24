import { Redo2, Undo2, X } from "lucide-react";

import { CollaboratorAvatar, collaboratorPlaceText } from "@shared/collaborators";
import { collaboratorTitle } from "@shared/core";
import { useCollaboratorsStore } from "@shared/stores/collaborators-store";
import { Button } from "@shared/ui/components/ui/button";
import { cn } from "@shared/ui/lib/utils";
import { useEngine, useEngineState } from "../../engine-context";
import { ToolButton } from "../tool-button";
import type { FollowBarProps } from "./follow-bar.types";

/**
 * The bar at the top of the canvas while following someone: who, what they're doing and where,
 * Undo and Redo of their steps (agents; Ctrl+Z does the same meanwhile) and Stop following.
 */
export function FollowBar({ collaborator, history }: FollowBarProps) {
  const engine = useEngine();
  // Below the rulers when they show.
  const rulers = useEngineState((state) => state.rulersShown) && engine.view.rulers;
  const { color, state } = collaborator;
  const name = collaboratorTitle(collaborator);
  const place = collaboratorPlaceText(collaborator);
  const undoKey = engine.keymap.label("undo");

  return (
    <div
      className={cn(
        "pointer-events-auto absolute left-1/2 flex max-w-[min(40rem,calc(100%-2rem))] -translate-x-1/2 items-center gap-2 rounded-lg border-2 bg-surface py-1 pr-1 pl-1.5 text-sm text-foreground shadow-md",
        rulers ? "top-8" : "top-3",
      )}
      style={{ borderColor: color }}
      role="status"
    >
      <CollaboratorAvatar collaborator={collaborator} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-medium">Following {name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {[state.activity?.label, place].filter(Boolean).join(" · ") || "Watching their view"}
        </span>
      </span>
      {history && (
        <span className="flex items-center gap-0.5 border-l pl-1.5">
          <ToolButton
            label={history.undoLabel ? `Undo: ${history.undoLabel}` : `Undo ${name}'s change`}
            description={
              undoKey ? `${undoKey} undoes ${name}'s changes while you follow` : undefined
            }
            side="bottom"
            className="size-8"
            disabled={!history.canUndo}
            onClick={history.undo}
          >
            <Undo2 />
          </ToolButton>
          <ToolButton
            label={history.redoLabel ? `Redo: ${history.redoLabel}` : `Redo ${name}'s change`}
            side="bottom"
            className="size-8"
            disabled={!history.canRedo}
            onClick={history.redo}
          >
            <Redo2 />
          </ToolButton>
        </span>
      )}
      <Button size="sm" variant="ghost" onClick={() => useCollaboratorsStore.getState().unfollow()}>
        <X />
        Stop following
      </Button>
    </div>
  );
}
