import type { DbColumnPatch } from "../../schema/db-schema.types";
import { useBoardSchema } from "../schema";
import { FlagToggle } from "./flag-toggle";
import type { ColumnFlagsProps } from "./column-flags.types";

const FLAGS = [
  { key: "pk", label: "PK", title: "Primary key" },
  { key: "notNull", label: "NN", title: "Not null" },
  { key: "unique", label: "UQ", title: "Unique" },
  { key: "increment", label: "AI", title: "Auto increment" },
] as const;

/** Toggles for the column constraints. */
export function ColumnFlags({ table, column }: ColumnFlagsProps) {
  const schema = useBoardSchema();

  return (
    <div className="flex gap-1" role="group" aria-label="Constraints">
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
