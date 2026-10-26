import { Eye, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { CommitInput } from "@canvas-ui";
import { cn } from "@shared/ui/kit";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import type { ModeGroupCardProps } from "./inspector.types";
import { ModeRow } from "./mode-row";

/**
 * A mode group (Theme, Language…): its name, its modes (dropping a dragged mode on the group puts
 * it at the end), "+ Mode", showing it on the board, and deleting it after asking.
 */
export function ModeGroupCard({ axis, shown, moves }: ModeGroupCardProps) {
  const { tokens, store } = useBoard();
  const setAxis = useVariablesWindowStore((state) => state.setAxis);
  const [over, setOver] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { drag } = moves;
  const accepts = drag !== null && drag.axisId !== axis.id;
  const varying = store.variables().filter((v) => v.axisId === axis.id).length;
  return (
    <div
      onDragOver={(event) => {
        if (!accepts) return;
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(event) => {
        setOver(false);
        if (!accepts || !drag) return;
        event.preventDefault();
        moves.move(drag.modeId, axis.id);
      }}
      className={cn(
        "flex flex-col gap-1.5 rounded-md border border-border p-2",
        shown && "border-primary/50",
        over && "border-primary bg-primary/5",
      )}
    >
      <div className="flex items-center gap-1">
        <CommitInput
          aria-label="Mode group name"
          value={axis.name}
          onCommit={(name) => tokens.renameAxis(axis.id, name)}
          className="h-7 min-w-0 flex-1 text-xs font-medium"
        />
        <button
          type="button"
          aria-label={`Show ${axis.name} on the board`}
          title={shown ? "Shown on the board" : "Show on the board"}
          onClick={() => setAxis(axis.id)}
          className={cn(
            "flex size-7 items-center justify-center rounded-md hover:bg-muted",
            shown ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Eye className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Delete ${axis.name}`}
          title={`Delete ${axis.name}`}
          onClick={() => setConfirming(true)}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      {confirming && (
        <div className="flex flex-col gap-1.5 rounded-md bg-surface-sunken p-2">
          <p>
            Delete {axis.name}?{" "}
            {varying > 0
              ? `${varying} variable${varying === 1 ? "" : "s"} vary by it and keep only their first mode's value.`
              : "No variable varies by it."}
          </p>
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-md px-2 py-1 hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                tokens.deleteAxis(axis.id);
              }}
              className="rounded-md bg-destructive px-2 py-1 text-destructive-foreground"
            >
              Delete
            </button>
          </div>
        </div>
      )}
      {axis.modes.map((mode, i) => (
        <ModeRow key={mode.id} axis={axis} mode={mode} first={i === 0} moves={moves} />
      ))}
      <button
        type="button"
        onClick={() => tokens.addMode(axis.id)}
        className="flex items-center gap-1 self-start rounded-md px-1.5 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Plus className="size-3.5" /> Mode
      </button>
    </div>
  );
}
