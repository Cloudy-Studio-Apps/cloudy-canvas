import { LocateFixed } from "lucide-react";

import { Button } from "@ui/components/ui/button";
import { useEngine } from "../../engine/engine-context";
import { useDbQuery } from "../../engine/use-db-table";
import type { IncomingRefsProps } from "./incoming-refs.types";

/** Columns of other tables that point at this table, with a shortcut to jump to them. */
export function IncomingRefs({ tableId }: IncomingRefsProps) {
  const engine = useEngine();
  const refs = useDbQuery((db) => db.incomingRefs(tableId), tableId);
  if (refs.length === 0) return null;

  return (
    <section className="space-y-1">
      <h3 className="text-xs font-medium text-muted-foreground">Referenced by</h3>
      <ul>
        {refs.map(({ table, column, target }) => (
          <li key={`${table.id}/${column.id}`} className="flex items-center gap-1 text-sm">
            <span className="min-w-0 flex-1 truncate">
              {table.name}.{column.name}
              <span className="text-muted-foreground"> → {target.name}</span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={`Go to ${table.name}`}
              title="Go to table"
              onClick={() => engine.focusShape(table.id)}
            >
              <LocateFixed />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
