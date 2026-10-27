import { GripVertical, X } from "lucide-react";
import { useState } from "react";

import { CommitInput } from "@canvas-ui";
import { notifyError } from "@shared/stores/toast-store";
import { cn } from "@shared/ui/kit";
import { useBoard } from "../use-board";
import type { ModeRowProps } from "./inspector.types";
import { MoveModeMenu } from "./move-mode-menu";
import { t } from "../../../variables.i18n";

/**
 * A mode in its group: renamed in place, dragged by its grip to another group (or dropped on
 * here, a dragged mode goes before it), moved with its menu, removed. The first mode stays.
 */
export function ModeRow({ axis, mode, first, moves }: ModeRowProps) {
  const { tokens } = useBoard();
  const [over, setOver] = useState(false);
  const { drag } = moves;
  const accepts = !first && drag !== null && drag.modeId !== mode.id;
  return (
    <div
      onDragOver={(event) => {
        if (!accepts) return;
        event.preventDefault();
        event.stopPropagation();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        setOver(false);
        if (!accepts || !drag) return;
        event.preventDefault();
        event.stopPropagation();
        moves.move(drag.modeId, axis.id, mode.id);
      }}
      className={cn(
        "flex items-center gap-1 border-t-2 border-transparent",
        over && "border-primary",
        drag?.modeId === mode.id && "opacity-50",
      )}
    >
      <span
        draggable={!first}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", mode.name);
          moves.setDrag({ modeId: mode.id, axisId: axis.id });
        }}
        onDragEnd={() => moves.setDrag(null)}
        title={first ? undefined : t("inspector.dragToGroup")}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center text-subtle-foreground",
          first ? "opacity-30" : "cursor-grab active:cursor-grabbing",
        )}
      >
        <GripVertical className="size-3.5" />
      </span>
      <CommitInput
        aria-label={t("inspector.modeName")}
        value={mode.name}
        onCommit={(name) => tokens.renameMode(axis.id, mode.id, name)}
        className="h-7 min-w-0 flex-1 text-xs"
      />
      {first ? (
        <span
          className="w-14 text-center text-[10px] text-subtle-foreground"
          title={t("inspector.firstHint")}
        >
          {t("inspector.first")}
        </span>
      ) : (
        <>
          <MoveModeMenu axis={axis} mode={mode} moves={moves} />
          <button
            type="button"
            aria-label={t("inspector.remove", { name: mode.name })}
            title={t("inspector.remove", { name: mode.name })}
            onClick={() => {
              try {
                tokens.removeMode(axis.id, mode.id);
              } catch (error) {
                notifyError(t("inspector.removeError"), error);
              }
            }}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="size-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
