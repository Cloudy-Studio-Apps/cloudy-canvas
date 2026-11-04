import { useService } from "@canvas-ui";
import { SelectField } from "@shared/ui/kit";
import { DESIGN_DATA_SOURCES } from "../../model";
import { t } from "../../data.i18n";
import { startUpdate } from "../hooks/run-update";
import { AUTO_ROWS, extrasText, rowsFromOptions } from "./rows-from";
import type { RowsFromFieldProps } from "./rows-from-field.types";

/**
 * Where the rows are in the data: the first list found, or one the last Update saw (with how
 * many items each has); picking one updates the source. The plain values beside the rows show
 * under it (`total 194 · skip 0`). Hidden until an Update has found a list.
 */
export function RowsFromField({ source }: RowsFromFieldProps) {
  const sources = useService(DESIGN_DATA_SOURCES);
  const lists = source.snapshot?.lists ?? [];
  if (lists.length === 0 && source.rowsPath === null) return null;
  const extras = extrasText(source.snapshot?.extras);
  return (
    <div className="flex flex-col gap-1">
      <SelectField
        layout="stacked"
        label={t("rowsFrom.title")}
        value={source.rowsPath ?? AUTO_ROWS}
        options={rowsFromOptions(lists, source.rowsPath)}
        onChange={(value) => {
          const next = value === AUTO_ROWS ? null : value;
          if (next === source.rowsPath) return;
          sources.setRowsPath(source.id, next);
          startUpdate(sources, source.id);
        }}
      />
      {extras && <p className="text-xs text-muted-foreground">{extras}</p>}
    </div>
  );
}
