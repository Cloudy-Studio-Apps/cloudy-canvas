import { Plus } from "lucide-react";
import { useState } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError, toast } from "@shared/stores/toast-store";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { InspectorSection } from "./inspector-section";
import type { ModeDrag, ModeMoves } from "./inspector.types";
import { ModeGroupCard } from "./mode-group-card";

/**
 * With nothing picked: the mode groups (Theme, Language… each a set of modes; variables vary by
 * one of them, and pages and frames pick a mode of each), made, renamed, deleted and shown on the
 * board, and their modes added, renamed, removed and moved between groups by dragging them or
 * with their menu. A group's first mode holds the defaults the others fall back to.
 */
export function ModesInspector() {
  const engine = useDesignEngine();
  const { tokens, store, axis } = useBoard();
  const setAxis = useVariablesWindowStore((state) => state.setAxis);
  const [drag, setDrag] = useState<ModeDrag | null>(null);
  const axes = store.axes();

  const move = (modeId: string, axisId: string, beforeId?: string) => {
    setDrag(null);
    const from = store.axes().find((a) => a.modes.some((m) => m.id === modeId));
    const mode = from?.modes.find((m) => m.id === modeId);
    try {
      const { dropped } = tokens.moveMode(modeId, axisId, beforeId);
      if (dropped > 0 && from && mode) {
        toast({
          title: `Moved ${mode.name}`,
          description: `${dropped} variable${dropped === 1 ? "" : "s"} also vary by other ${from.name} modes: they keep those and lost their ${mode.name} value (Ctrl+Z brings it back).`,
        });
      }
    } catch (error) {
      notifyError("Couldn't move the mode", error);
    }
  };
  const moves: ModeMoves = {
    drag,
    setDrag,
    move,
    moveToNewGroup: (modeId) => {
      // Making the group and moving the mode in are one undo step.
      engine.doc.checkpoint();
      const release = engine.doc.holdCheckpoints();
      try {
        const group = tokens.createAxis("New group");
        move(modeId, group.id);
        setAxis(group.id);
      } finally {
        release();
      }
    },
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      <InspectorSection
        title="Mode groups"
        actions={
          <button
            type="button"
            onClick={() => setAxis(tokens.createAxis("New group").id)}
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Plus className="size-3.5" /> Group
          </button>
        }
      >
        {axes.length === 0 ? (
          <p className="text-muted-foreground">
            One value per variable. Add a group of modes (like Theme with Light and Dark) to give
            variables other values; groups combine (Theme × Language).
          </p>
        ) : (
          <>
            <p className="text-muted-foreground">
              Drag a mode by its grip to another group, or use its menu.
            </p>
            {axes.map((group) => (
              <ModeGroupCard
                key={group.id}
                axis={group}
                shown={group.id === axis?.id}
                moves={moves}
              />
            ))}
          </>
        )}
      </InspectorSection>
      <p className="text-muted-foreground">Pick a card to edit it.</p>
    </div>
  );
}
