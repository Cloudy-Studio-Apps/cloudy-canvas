import type { DbColumnPatch } from "../../schema/db-schema.types";
import { useBoardSchema } from "../schema";
import { FlagToggle } from "./flag-toggle";
import type { ColumnFlagsProps } from "./column-flags.types";
import { t } from "../../db.i18n";

const FLAGS = [
  { key: "pk", label: "PK", title: t("flags.pk") },
  { key: "notNull", label: "NN", title: t("flags.notNull") },
  { key: "unique", label: "UQ", title: t("flags.unique") },
  { key: "increment", label: "AI", title: t("flags.increment") },
] as const;

/** Toggles for the column constraints. */
export function ColumnFlags({ table, column }: ColumnFlagsProps) {
  const schema = useBoardSchema();

  return (
    <div className="flex gap-1" role="group" aria-label={t("flags.group")}>
      {FLAGS.map(({ key, label, title }) => (
        <FlagToggle
          key={key}
          label={label}
          title={title}
          on={column[key]}
          onToggle={() => {
            const patch: DbColumnPatch = { [key]: !column[key] };
            schema.updateColumn(table.id, column.id, patch);
          }}
        />
      ))}
    </div>
  );
}
