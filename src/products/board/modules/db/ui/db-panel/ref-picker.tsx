import { useState } from "react";
import { Link2, LocateFixed, Unlink } from "lucide-react";

import {
  Button,
  cn,
  ListRow,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SearchInput,
} from "@shared/ui/kit";
import { useEngine } from "@canvas-ui";
import { useBoardSchema, useDbQuery } from "../schema";
import { REF_KINDS } from "./ref-kinds";
import type { RefPickerProps } from "./ref-picker.types";
import { t } from "../../db.i18n";

/** Links a column to any column on the board, however far away its table is. */
export function RefPicker({ table, column }: RefPickerProps) {
  const engine = useEngine();
  const schema = useBoardSchema();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { ref } = column;

  const targets = useDbQuery((db) => db.columnTargets());
  const current =
    ref && targets.find((t) => t.tableId === ref.tableId && t.columnId === ref.columnId);
  const needle = query.trim().toLowerCase();
  const matches = targets.filter(
    (t) =>
      !(t.tableId === table.id && t.columnId === column.id) &&
      `${t.tableName}.${t.columnName}`.toLowerCase().includes(needle),
  );

  const link = (tableId: string, columnId: string) => {
    schema.setColumnRef(table.id, column.id, { tableId, columnId, kind: ref?.kind ?? ">" });
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-7", current && "text-primary hover:text-primary")}
          aria-label={
            current
              ? t("ref.relationTo", { target: `${current.tableName}.${current.columnName}` })
              : t("ref.add")
          }
          title={current ? `→ ${current.tableName}.${current.columnName}` : t("ref.add")}
        >
          <Link2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3">
        {current && ref && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate">
                <span className="text-muted-foreground">→ </span>
                {current.tableName}.{current.columnName}
              </span>
              <div className="flex shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={t("nav.goToTable")}
                  title={t("nav.goToTable")}
                  onClick={() => {
                    setOpen(false);
                    engine.focusElement(current.tableId);
                  }}
                >
                  <LocateFixed />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={t("ref.remove")}
                  title={t("ref.remove")}
                  onClick={() => {
                    schema.setColumnRef(table.id, column.id, null);
                    setOpen(false);
                  }}
                >
                  <Unlink />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1" role="radiogroup" aria-label={t("ref.kind")}>
              {REF_KINDS.map(({ kind, label, description }) => (
                <Button
                  key={kind}
                  variant={ref.kind === kind ? "secondary" : "ghost"}
                  size="sm"
                  role="radio"
                  aria-checked={ref.kind === kind}
                  title={description}
                  onClick={() => schema.setColumnRef(table.id, column.id, { ...ref, kind })}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        )}
        <SearchInput
          autoFocus
          size="sm"
          placeholder={t("ref.search")}
          value={query}
          onChange={setQuery}
          onKeyDown={(event) => {
            const first = matches[0];
            if (event.key === "Enter" && first) link(first.tableId, first.columnId);
          }}
        />
        <ul className="-mx-1 max-h-56 overflow-y-auto">
          {matches.length === 0 && (
            <li className="px-2 py-1.5 text-sm text-muted-foreground">{t("ref.noColumns")}</li>
          )}
          {matches.map((t) => (
            <li key={`${t.tableId}/${t.columnId}`}>
              <ListRow
                size="md"
                onSelect={() => link(t.tableId, t.columnId)}
                label={
                  <>
                    {t.tableName}.<span className="font-medium">{t.columnName}</span>
                  </>
                }
                meta={
                  <>
                    {t.pk && <span className="mr-2 font-semibold">PK</span>}
                    {t.type}
                  </>
                }
              />
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
