import type { DbColumnPatch } from "@engine";
import { cn } from "@ui/lib/utils";
import { useEngine } from "../../engine/engine-context";
import type { ColumnFlagsProps } from "./column-flags.types";

const FLAGS = [
  { key: "pk", label: "PK", title: "Primary key" },
  { key: "notNull", label: "NN", title: "Not null" },
  { key: "unique", label: "UQ", title: "Unique" },
  { key: "increment", label: "AI", title: "Auto increment" },
] as const;

/** Toggles for the column constraints. */
export function ColumnFlags({ table, column }: ColumnFlagsProps) {
  const engine = useEngine();

  return (
    <div className="flex gap-1" role="group" aria-label="Constraints">
      {FLAGS.map(({ key, label, title }) => {
        const on = column[key];
        return (
          <button
            key={key}
            type="button"
            aria-pressed={on}
            title={title}
            className={cn(
              "h-6 cursor-pointer rounded-sm border px-1.5 text-[11px] font-semibold transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
              on
                ? "border-primary bg-primary-soft text-primary-soft-foreground"
                : "border-border text-muted-foreground hover:bg-hover",
            )}
            onClick={() => {
              const patch: DbColumnPatch = { [key]: !on };
              engine.db.updateColumn(table.id, column.id, patch);
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
