import { Info } from "lucide-react";

import { Badge, SelectField } from "@shared/ui/kit";
import { t } from "../../data.i18n";
import { errorText } from "../data-tab/error-text";
import { FieldTypeIcon } from "../data-tab/field-type-icon";
import { RowsTable } from "../data-tab/rows-table";
import { AUTO_ROWS, extrasText, rowsFromOptions } from "../data-tab/rows-from";
import type { TryResultProps } from "./try-result.types";
import { TryStat } from "./try-stat";

/** What Try it found: counts, where the rows come from, the fields at the top, the first rows. */
export function TryResult({ result, rowsPath, onRowsPath }: TryResultProps) {
  const top = new Map<string, (typeof result.fields)[number]>();
  for (const field of result.fields) {
    const head = /^[^.[]+/.exec(field.path)?.[0] ?? field.path;
    if (!top.has(head)) top.set(head, field);
  }
  const groups = [...top.keys()].filter((head) =>
    result.fields.some((f) => f.path !== head && f.path.startsWith(head)),
  ).length;
  const extras = extrasText(result.extras);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      <Badge className="self-start">{t("connection.try.works")}</Badge>
      <div className="grid grid-cols-3 gap-1.5">
        <TryStat value={result.rowCount} label={t("connection.try.rows")} />
        <TryStat value={result.fields.length} label={t("connection.try.fields")} />
        <TryStat value={groups} label={t("connection.try.groups")} />
      </div>
      <SelectField
        layout="stacked"
        label={t("rowsFrom.title")}
        value={rowsPath ?? AUTO_ROWS}
        options={rowsFromOptions(result.lists, rowsPath)}
        onChange={(value) => onRowsPath(value === AUTO_ROWS ? null : value)}
      />
      {result.notes?.map((note) => (
        <p key={note} className="flex items-start gap-1 text-xs text-warning">
          <Info className="mt-0.5 size-3 shrink-0" />
          {errorText(note)}
        </p>
      ))}
      {extras && <p className="text-xs text-muted-foreground">{extras}</p>}
      <div className="flex flex-wrap gap-1">
        {[...top.entries()].map(([head, field]) => {
          const nested = field.path !== head;
          return (
            <span
              key={head}
              className="inline-flex h-5 items-center gap-1 rounded-sm border border-border bg-surface px-1.5 text-xs text-muted-foreground"
            >
              <FieldTypeIcon type={nested ? "object" : field.type} className="size-3" />
              {head}
            </span>
          );
        })}
      </div>
      <RowsTable rows={result.rows} fields={result.fields} />
    </div>
  );
}
