import { Plus } from "lucide-react";

import { DragGhost, useRowDrag } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError, toast } from "@shared/stores/toast-store";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { InspectorSection } from "./inspector-section";
import type { ModeMoves } from "./inspector.types";
import { axisIdOf } from "./mode-drop-id";
import { ModeGroupCard } from "./mode-group-card";
import { t } from "../../../variables.i18n";

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
  const axes = store.axes();

  const move = (modeId: string, axisId: string, beforeId?: string) => {
    const from = store.axes().find((a) => a.modes.some((m) => m.id === modeId));
    const mode = from?.modes.find((m) => m.id === modeId);
    try {
      const { dropped } = tokens.moveMode(modeId, axisId, beforeId);
      if (dropped > 0 && from && mode) {
        toast({
          title: t("inspector.moved", { name: mode.name }),
          description: t("inspector.movedDescription", {
            count: dropped,
            from: from.name,
            mode: mode.name,
          }),
        });
      }
    } catch (error) {
      notifyError(t("inspector.moveError"), error);
    }
  };
  const axisOfMode = (modeId: string) =>
    store.axes().find((a) => a.modes.some((m) => m.id === modeId));
  const rowDrag = useRowDrag({
    canDrop: (id, overId) => {
      const target = axisIdOf(overId);
      if (target !== null) return axisOfMode(id)?.id !== target;
      return axisOfMode(overId)?.modes[0]?.id !== overId;
    },
    onDrop: (id, overId) => {
      const target = axisIdOf(overId);
      if (target !== null) {
        move(id, target);
        return;
      }
      const axisId = axisOfMode(overId)?.id;
      if (axisId) move(id, axisId, overId);
    },
  });
  const moves: ModeMoves = {
    rowDrag,
    move,
    moveToNewGroup: (modeId) => {
      // Making the group and moving the mode in are one undo step.
      engine.doc.checkpoint();
      const release = engine.doc.holdCheckpoints();
      try {
        const group = tokens.createAxis(t("defaults.modeGroup"));
        move(modeId, group.id);
        setAxis(group.id);
      } finally {
        release();
      }
    },
  };

  const dragged = axes.flatMap((a) => a.modes).find((m) => m.id === rowDrag.drag?.id);

  return (
    <div className="flex flex-col gap-4 text-xs">
      <InspectorSection
        title={t("inspector.modeGroups")}
        actions={
          <button
            type="button"
            onClick={() => setAxis(tokens.createAxis(t("defaults.modeGroup")).id)}
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Plus className="size-3.5" /> {t("inspector.group")}
          </button>
        }
      >
        {axes.length === 0 ? (
          <p className="text-muted-foreground">{t("inspector.noModes")}</p>
        ) : (
          <>
            <p className="text-muted-foreground">{t("inspector.dragHint")}</p>
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
      <p className="text-muted-foreground">{t("inspector.pickCard")}</p>
      {dragged && rowDrag.drag && <DragGhost label={dragged.name} pointer={rowDrag.drag.pointer} />}
    </div>
  );
}
