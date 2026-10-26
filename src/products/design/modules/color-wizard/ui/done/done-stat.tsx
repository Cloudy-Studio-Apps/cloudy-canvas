import type { DoneStatProps } from "./done.types";

/** One number of what was made. */
export function DoneStat({ value, label }: DoneStatProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-surface px-1.5 py-2.5">
      <b className="text-lg">{value}</b>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
