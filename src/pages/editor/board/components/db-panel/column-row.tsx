import { Trash2 } from "lucide-react";

import { Button } from "@ui/components/ui/button";
import { useEngine } from "../../engine/engine-context";
import { ColumnDetails } from "./column-details";
import { ColumnFlags } from "./column-flags";
import { CommitInput } from "./commit-input";
import { RefPicker } from "./ref-picker";
import type { ColumnRowProps } from "./column-row.types";

export function ColumnRow({ table, column, index, typeListId }: ColumnRowProps) {
  const engine = useEngine();

  return (
    <li className="space-y-1.5 border-b py-2 last:border-b-0">
      <div className="flex items-center gap-1">
        <CommitInput
          value={column.name}
          aria-label="Column name"
          className="h-7 min-w-0 flex-1 text-sm"
          onCommit={(name) => engine.db.updateColumn(table.id, column.id, { name })}
        />
        <CommitInput
          value={column.type}
          aria-label="Column type"
          list={typeListId}
          className="h-7 w-28 font-mono text-xs"
          onCommit={(type) => engine.db.updateColumn(table.id, column.id, { type: type.trim() })}
        />
        <RefPicker table={table} column={column} />
        <ColumnDetails table={table} column={column} index={index} />
        <Button
          variant="ghost"
          size="icon"
          className="size-7 hover:text-destructive"
          aria-label={`Delete column ${column.name}`}
          title="Delete column"
          onClick={() => engine.db.removeColumn(table.id, column.id)}
        >
          <Trash2 />
        </Button>
      </div>
      <ColumnFlags table={table} column={column} />
    </li>
  );
}
