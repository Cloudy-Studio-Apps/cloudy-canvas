import { useId } from "react";
import { Plus } from "lucide-react";

import { INDEX_TYPES } from "../../schema/column-types";
import { Button } from "@shared/ui/components/ui/button";
import { useBoardSchema } from "../schema";
import { IndexRow } from "./index-row";
import type { IndexListProps } from "./index-list.types";

/** The table's indexes. */
export function IndexList({ table }: IndexListProps) {
  const schema = useBoardSchema();
  const typeListId = useId();

  return (
    <section className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">Indexes</h3>
        <Button
          variant="ghost"
          size="sm"
          disabled={table.columns.length === 0}
          onClick={() => schema.addIndex(table.id)}
        >
          <Plus />
          Add index
        </Button>
      </div>
      <datalist id={typeListId}>
        {INDEX_TYPES.map((type) => (
          <option key={type} value={type} />
        ))}
      </datalist>
      {table.indexes.length === 0 ? (
        <p className="text-xs text-muted-foreground">No indexes.</p>
      ) : (
        <ul>
          {table.indexes.map((index) => (
            <IndexRow key={index.id} table={table} index={index} typeListId={typeListId} />
          ))}
        </ul>
      )}
    </section>
  );
}
