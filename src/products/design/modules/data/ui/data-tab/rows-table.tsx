import { cellText } from "./value-text";
import type { RowsTableProps } from "./rows-table.types";
import { t } from "../../data.i18n";

/** How many rows the table shows. */
const MAX_ROWS = 200;

/** The first rows of the data, one column per visible field, long text cut short. */
export function RowsTable({ rows, fields }: RowsTableProps) {
  const columns = fields.filter((field) => !field.hidden);
  if (rows.length === 0)
    return <p className="text-xs text-muted-foreground">{t("source.table.empty")}</p>;
  const shown = rows.slice(0, MAX_ROWS);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="max-h-80 overflow-auto rounded-md border border-border">
        <table className="w-max min-w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-surface-sunken">
            <tr>
              {columns.map((field) => (
                <th
                  key={field.path}
                  scope="col"
                  className="max-w-40 truncate border-b border-border px-2 py-1 text-left font-medium text-muted-foreground"
                >
                  {field.alias ?? field.path}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, index) => (
              <tr key={index} className="border-b border-border last:border-b-0">
                {columns.map((field) => {
                  const text = cellText(row, field.path);
                  return (
                    <td
                      key={field.path}
                      title={text}
                      className="max-w-40 truncate px-2 py-1 text-foreground"
                    >
                      {text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > MAX_ROWS && (
        <p className="text-xs text-muted-foreground">
          {t("source.table.showing", { shown: MAX_ROWS, count: rows.length })}
        </p>
      )}
    </div>
  );
}
