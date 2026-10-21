import { ChevronDown, ChevronUp, Ellipsis } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { cn } from "@shared/ui/lib/utils";
import { useBoardSchema } from "../../schema";
import { CommitInput } from "./commit-input";
import { CommitTextarea } from "./commit-textarea";
import type { ColumnDetailsProps } from "./column-details.types";

/** Default value, note and order of a column. */
export function ColumnDetails({ table, column, index }: ColumnDetailsProps) {
  const schema = useBoardSchema();
  const hasDetails = column.default !== null || column.note !== "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-7", hasDetails && "text-foreground")}
          aria-label="Column details"
          title="Default, note and order"
        >
          <Ellipsis />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Default</span>
          <CommitInput
            value={column.default ?? ""}
            placeholder="e.g. 0, 'draft', `now()`"
            className="font-mono text-xs"
            onCommit={(value) => {
              schema.updateColumn(table.id, column.id, { default: value.trim() || null });
            }}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Note</span>
          <CommitTextarea
            value={column.note}
            rows={3}
            onCommit={(note) => {
              schema.updateColumn(table.id, column.id, { note });
            }}
          />
        </label>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Order</span>
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Move up"
              disabled={index === 0}
              onClick={() => schema.moveColumn(table.id, column.id, index - 1)}
            >
              <ChevronUp />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Move down"
              disabled={index === table.columns.length - 1}
              onClick={() => schema.moveColumn(table.id, column.id, index + 1)}
            >
              <ChevronDown />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
