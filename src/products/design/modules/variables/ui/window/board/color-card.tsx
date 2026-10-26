import { DEFAULT_VALUE, resolveVariable, valueKeyOf } from "@canvas";
import { cn } from "@shared/ui/kit";
import { leafName } from "../group-paths";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import type { ColorCardProps } from "./board.types";
import { SwatchHalves } from "./swatch-halves";

/** A color variable on the board: its color in each shown mode, its name and hex. */
export function ColorCard({ variable, shown, selected }: ColorCardProps) {
  const { store } = useBoard();
  const select = useVariablesWindowStore((state) => state.select);
  const colors = shown.map((mode) => {
    const value = resolveVariable(store, variable.id, mode.context);
    return value?.type === "color" ? value.color : "#00000000";
  });
  const faded = shown.map((mode) => {
    const key = valueKeyOf(store, mode.id);
    return key !== DEFAULT_VALUE && !(key in variable.values);
  });
  return (
    <button
      type="button"
      onClick={() => select(variable.id)}
      className={cn(
        "overflow-hidden rounded-card border border-border bg-surface text-left transition hover:-translate-y-px hover:border-border-strong",
        selected && "border-primary ring-2 ring-primary/20",
      )}
    >
      <SwatchHalves colors={colors} faded={faded} />
      <div className="px-2 py-1.5">
        <b className="block truncate text-xs font-medium">{leafName(variable)}</b>
        <span className="font-mono text-[11px] text-muted-foreground">
          {colors[0]?.slice(0, 7)}
        </span>
      </div>
    </button>
  );
}
