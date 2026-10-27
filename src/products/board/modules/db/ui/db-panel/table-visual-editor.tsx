import { Plus } from "lucide-react";

import { DB_HEADER_COLORS } from "../../../../palette";
import { Button } from "@shared/ui/kit";
import { ColorPalette, CommitInput, CommitTextarea } from "@canvas-ui";
import { useBoardSchema } from "../schema";
import { ColumnRow } from "./column-row";
import { IncomingRefs } from "./incoming-refs";
import { IndexList } from "./index-list";
import type { TableVisualEditorProps } from "./table-visual-editor.types";
import { t } from "../../db.i18n";

/** Form view of one table: name, color, columns, indexes, and the note shown beside it. */
export function TableVisualEditor({ table }: TableVisualEditorProps) {
  const schema = useBoardSchema();

  return (
    <div className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">{t("tableEditor.name")}</span>
        <CommitInput
          value={table.name}
          onCommit={(name) => schema.updateTable(table.id, { name })}
        />
      </label>

      <div className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">
          {t("tableEditor.headerColor")}
        </span>
        <div className="flex gap-0.5">
          <ColorPalette
            colors={DB_HEADER_COLORS}
            value={table.headerColor}
            onSelect={(headerColor) => schema.updateTable(table.id, { headerColor })}
          />
        </div>
      </div>

      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">{t("tableEditor.columns")}</h3>
          <Button variant="ghost" size="sm" onClick={() => schema.addColumn(table.id)}>
            <Plus />
            {t("tableEditor.addColumn")}
          </Button>
        </div>
        <ul>
          {table.columns.map((column, index) => (
            <ColumnRow key={column.id} table={table} column={column} index={index} />
          ))}
        </ul>
      </section>

      <IndexList table={table} />

      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">{t("tableEditor.note")}</span>
        <CommitTextarea
          value={table.note}
          rows={2}
          placeholder={t("tableEditor.notePlaceholder")}
          onCommit={(note) => schema.updateTable(table.id, { note })}
        />
      </label>

      <IncomingRefs tableId={table.id} />
    </div>
  );
}
