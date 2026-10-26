import { cn } from "@shared/ui/kit";
import type { GhostNumberCardProps } from "./board.types";
import { NumberVisual } from "./number-visual";

/** A step the scale is about to write, dashed, with what it does to the group. */
export function GhostNumberCard({ step, kind, max, state }: GhostNumberCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-card border border-dashed border-primary p-2.5 opacity-90">
      <b className="truncate text-xs font-medium">
        {step.name}
        <span
          className={cn(
            "ml-1 font-normal",
            state === "base" ? "text-muted-foreground" : "text-primary",
          )}
        >
          · {state}
        </span>
      </b>
      <div className="flex h-11 items-center overflow-hidden">
        <NumberVisual kind={kind} value={step.value} max={max} />
      </div>
      <span className="font-mono text-[11px] text-muted-foreground">{step.value}</span>
    </div>
  );
}
