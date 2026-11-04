import type { TryStatProps } from "./try-stat.types";

/** One count of what Try it found (rows, fields, groups). */
export function TryStat({ value, label }: TryStatProps) {
  return (
    <div className="rounded-md border border-border bg-surface px-2 py-1.5">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
