import { Check, X } from "lucide-react";

import { resolveVariable } from "@canvas";
import { cn } from "@shared/ui/kit";
import { leafName } from "../group-paths";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import type { PlainCardProps } from "./board.types";

/**
 * A text or boolean variable on the board: its value in each shown mode, one line each (a
 * "Language" axis reads as its translations, a feature flag as on or off).
 */
export function PlainCard({ variable, shown, selected }: PlainCardProps) {
  const { store } = useBoard();
  const select = useVariablesWindowStore((state) => state.select);
  return (
    <button
      type="button"
      onClick={() => select(variable.id)}
      className={cn(
        "flex min-w-0 flex-col gap-1.5 rounded-card border border-border bg-surface p-2.5 text-left transition hover:-translate-y-px hover:border-border-strong",
        selected && "border-primary ring-2 ring-primary/20",
      )}
    >
      <b className="truncate text-xs font-medium">{leafName(variable)}</b>
      <div className="flex min-h-11 flex-col justify-center gap-1">
        {shown.map((mode) => {
          const value = resolveVariable(store, variable.id, mode.context);
          return (
            <span
              key={mode.id}
              className="flex min-w-0 items-center gap-1.5 text-xs"
              title={shown.length > 1 ? mode.name : undefined}
            >
              {value?.type === "boolean" ? (
                <>
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-xs border",
                      value.boolean
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-subtle-foreground",
                    )}
                  >
                    {value.boolean ? <Check className="size-3" /> : <X className="size-3" />}
                  </span>
                  {value.boolean ? "True" : "False"}
                </>
              ) : (
                <span className="truncate">
                  {value?.type === "string" ? `“${value.string}”` : "?"}
                </span>
              )}
            </span>
          );
        })}
      </div>
      {shown.length > 1 && (
        <span className="truncate text-[11px] text-muted-foreground">
          {shown.map((mode) => mode.name).join(" · ")}
        </span>
      )}
    </button>
  );
}
