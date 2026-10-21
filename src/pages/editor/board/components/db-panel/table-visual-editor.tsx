import { useId } from "react";
import { Plus } from "lucide-react";

import { DB_HEADER_COLORS } from "@engine";
import { Button } from "@ui/components/ui/button";
import { useEngine } from "../../engine/engine-context";
import { ColorSwatch } from "../tool-options/color-swatch";
import { ColumnRow } from "./column-row";
import { COLUMN_TYPES } from "./column-types";
import { CommitInput } from "./commit-input";
import { CommitTextarea } from "./commit-textarea";
import { IncomingRefs } from "./incoming-refs";
import type { TableVisualEditorProps } from "./table-visual-editor.types";

/** Form view of one table: name, color, columns with constraints and relations, and a note. */
export function TableVisualEditor({ table }: TableVisualEditorProps) {
  const engine = useEngine();
  const typeListId = useId();

  return (
    <div className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Table name</span>
        <CommitInput
          value={table.name}
          onCommit={(name) => engine.db.updateTable(table.id, { name })}
        />
      </label>

      <div className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Header color</span>
        <div className="flex gap-0.5">
          {DB_HEADER_COLORS.map((color) => (
            <ColorSwatch
              key={color.value}
              label={color.name}
              color={color.value}
              selected={table.headerColor === color.value}
              onSelect={() => engine.db.updateTable(table.id, { headerColor: color.value })}
            />
          ))}
        </div>
      </div>

      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">Columns</h3>
          <Button variant="ghost" size="sm" onClick={() => engine.db.addColumn(table.id)}>
            <Plus />
            Add column
          </Button>
        </div>
        <datalist id={typeListId}>
          {COLUMN_TYPES.map((type) => (
            <option key={type} value={type} />
          ))}
        </datalist>
        <ul>
          {table.columns.map((column, index) => (
            <ColumnRow
              key={column.id}
              table={table}
              column={column}
              index={index}
              typeListId={typeListId}
            />
          ))}
        </ul>
      </section>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Note</span>
        <CommitTextarea
          value={table.note}
          rows={2}
          placeholder="What this table is for"
          onCommit={(note) => engine.db.updateTable(table.id, { note })}
        />
      </label>

      <IncomingRefs tableId={table.id} />
    </div>
  );
}
