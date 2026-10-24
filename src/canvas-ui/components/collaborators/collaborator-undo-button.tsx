import { Undo2 } from "lucide-react";

import { ToolButton } from "../tool-button";
import { useCollaboratorHistory } from "./use-collaborator-history";
import type { CollaboratorUndoButtonProps } from "./collaborator-undo-button.types";

/**
 * Undoes a collaborator's last step without following it (the Agents menu's rows). Nothing when
 * its steps can't be undone here.
 */
export function CollaboratorUndoButton({ collaborator }: CollaboratorUndoButtonProps) {
  const history = useCollaboratorHistory(collaborator);
  if (!history) return null;
  return (
    <ToolButton
      label={
        history.undoLabel ? `Undo: ${history.undoLabel}` : `Undo ${collaborator.name}'s change`
      }
      side="right"
      className="size-8"
      disabled={!history.canUndo}
      onClick={history.undo}
    >
      <Undo2 />
    </ToolButton>
  );
}
