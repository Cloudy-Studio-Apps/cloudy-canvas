import type { InteractionRowProps } from "./interaction-row.types";

/** One labelled row of an interaction card: its label on the left, the control filling the rest. */
export function InteractionRow({ label, children }: InteractionRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
