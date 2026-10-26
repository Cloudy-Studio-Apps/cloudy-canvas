import { Trash2 } from "lucide-react";

import { Button } from "@shared/ui/kit";
import { CommitInput } from "@canvas-ui";
import { useBoardSchema } from "../schema";
import { ColumnDetails } from "./column-details";
import { ColumnFlags } from "./column-flags";
import { ColumnTypePicker } from "./column-type-picker";
import { RefPicker } from "./ref-picker";
import type { ColumnRowProps } from "./column-row.types";

export function ColumnRow({ table, column, index }: ColumnRowProps) {
  const schema = useBoardSchema();

  return (
    <li className="space-y-1.5 border-b py-2 last:border-b-0">
      <div className="flex items-center gap-1">
        <CommitInput
          value={column.name}
          aria-label="Column name"
          className="h-7 min-w-0 flex-1 text-sm"
          onCommit={(name) => schema.updateColumn(table.id, column.id, { name })}
        />
        <ColumnTypePicker table={table} column={column} />
        <RefPicker table={table} column={column} />
        <ColumnDetails table={table} column={column} index={index} />
        <Button
          variant="ghost"
          size="icon"
          className="size-7 hover:text-destructive"
          aria-label={`Delete column ${column.name}`}
          title="Delete column"
          onClick={() => schema.removeColumn(table.id, column.id)}
        >
          <Trash2 />
        </Button>
      </div>
      <ColumnFlags table={table} column={column} />
    </li>
  );
}
