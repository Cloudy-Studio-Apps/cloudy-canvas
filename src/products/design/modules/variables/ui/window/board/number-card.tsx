import { resolveVariable } from "@canvas";
import { cn } from "@shared/ui/kit";
import { numberKindOf } from "../group-kinds";
import { leafName } from "../group-paths";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import type { NumberCardProps } from "./board.types";
import { NumberVisual } from "./number-visual";

/** A number variable on the board, drawn for its kind, with its value in the first shown mode. */
export function NumberCard({ variable, shown, max, selected }: NumberCardProps) {
  const { store } = useBoard();
  const select = useVariablesWindowStore((state) => state.select);
  const values = shown.map((mode) => {
    const value = resolveVariable(store, variable.id, mode.context);
    return value?.type === "number" ? value.number : 0;
  });
  const value = values[0] ?? 0;
  return (
    <button
      type="button"
      onClick={() => select(variable.id)}
      className={cn(
        "flex flex-col gap-1.5 rounded-card border border-border bg-surface p-2.5 text-left transition hover:-translate-y-px hover:border-border-strong",
        selected && "border-primary ring-2 ring-primary/20",
      )}
    >
      <b className="truncate text-xs font-medium">{leafName(variable)}</b>
      <div className="flex h-11 items-center overflow-hidden">
        <NumberVisual kind={numberKindOf(variable).id} value={value} max={max} />
      </div>
      <span className="font-mono text-[11px] text-muted-foreground">
        {values.map((v) => Math.round(v * 100) / 100).join(" · ")}
      </span>
    </button>
  );
}
