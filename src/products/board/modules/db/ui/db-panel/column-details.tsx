import { ChevronDown, ChevronUp, Ellipsis } from "lucide-react";

import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@shared/ui/kit";
import { CommitInput, CommitTextarea } from "@canvas-ui";
import { useBoardSchema } from "../schema";
import type { ColumnDetailsProps } from "./column-details.types";
import { t } from "../../db.i18n";

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
          aria-label={t("column.details")}
          title={t("column.detailsHint")}
        >
          <Ellipsis />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">{t("column.default")}</span>
          <CommitInput
            value={column.default ?? ""}
            placeholder={t("column.defaultPlaceholder")}
            className="font-mono text-xs"
            onCommit={(value) => {
              schema.updateColumn(table.id, column.id, { default: value.trim() || null });
            }}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">{t("column.note")}</span>
          <CommitTextarea
            value={column.note}
            rows={3}
            onCommit={(note) => {
              schema.updateColumn(table.id, column.id, { note });
            }}
          />
        </label>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{t("column.order")}</span>
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t("column.moveUp")}
              disabled={index === 0}
              onClick={() => schema.moveColumn(table.id, column.id, index - 1)}
            >
              <ChevronUp />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t("column.moveDown")}
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
