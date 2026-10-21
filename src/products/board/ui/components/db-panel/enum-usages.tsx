import { LocateFixed } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { useEngine } from "@canvas-ui";
import { useDbQuery } from "../../schema";
import type { EnumUsagesProps } from "./enum-usages.types";

/** Columns typed with this enum, with a shortcut to jump to their table. */
export function EnumUsages({ enumId }: EnumUsagesProps) {
  const engine = useEngine();
  const usages = useDbQuery((db) => db.enumUsages(enumId), enumId);

  return (
    <section className="space-y-1">
      <h3 className="text-xs font-medium text-muted-foreground">Used by</h3>
      {usages.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No columns yet. Pick this enum in a column&apos;s type list.
        </p>
      )}
      <ul>
        {usages.map(({ table, column }) => (
          <li key={`${table.id}/${column.id}`} className="flex items-center gap-1 text-sm">
            <span className="min-w-0 flex-1 truncate">
              {table.name}.{column.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={`Go to ${table.name}`}
              title="Go to table"
              onClick={() => engine.focusElement(table.id)}
            >
              <LocateFixed />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
