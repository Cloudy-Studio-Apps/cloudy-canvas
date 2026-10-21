import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@ui/components/ui/button";
import { Input } from "@ui/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/ui/popover";
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
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-hover focus-visible:bg-hover"
                onClick={() => add({ kind: "column", columnId: column.id })}
              >
                <span className="min-w-0 flex-1 truncate">{column.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{column.type}</span>
              </button>
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
