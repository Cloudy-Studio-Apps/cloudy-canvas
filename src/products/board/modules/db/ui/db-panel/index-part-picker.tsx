import { useState } from "react";
import { Plus } from "lucide-react";

import { formatColumnType } from "../../table/column-type";
import { Button, Input, ListRow, Popover, PopoverContent, PopoverTrigger } from "@shared/ui/kit";
import type { IndexPartPickerProps } from "./index-part-picker.types";

/** Adds a column, or an expression like `lower(email)`, to an index. */
export function IndexPartPicker({ table, parts, onAdd }: IndexPartPickerProps) {
  const [open, setOpen] = useState(false);
  const [expr, setExpr] = useState("");
  const used = new Set(parts.flatMap((p) => (p.kind === "column" ? [p.columnId] : [])));
  const columns = table.columns.filter((c) => !used.has(c.id));

  const add: IndexPartPickerProps["onAdd"] = (part) => {
    onAdd(part);
    setOpen(false);
    setExpr("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Add to index"
          title="Add a column or expression"
        >
          <Plus />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 space-y-2 p-2">
        <ul className="max-h-48 overflow-y-auto">
          {columns.length === 0 && (
            <li className="px-2 py-1.5 text-sm text-muted-foreground">
              Every column is already in it
            </li>
          )}
          {columns.map((column) => (
            <li key={column.id}>
              <ListRow
                size="md"
                onSelect={() => add({ kind: "column", columnId: column.id })}
                label={column.name}
                meta={<span className="font-mono">{formatColumnType(column)}</span>}
              />
            </li>
          ))}
        </ul>
        <Input
          placeholder="Expression, e.g. lower(email)"
          value={expr}
          className="h-7 font-mono text-xs"
          onChange={(event) => setExpr(event.target.value)}
          onKeyDown={(event) => {
            const value = expr.trim().replace(/^`|`$/g, "");
            if (event.key === "Enter" && value) add({ kind: "expr", expr: value });
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
