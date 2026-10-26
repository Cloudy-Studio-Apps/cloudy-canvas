import { BoxSelect, Braces, LayoutGrid, X } from "lucide-react";

import { FloatingPanel, useEngine, useEngineState } from "@canvas-ui";
import { Button } from "@shared/ui/kit";
import { useBoardSchema } from "../schema";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { SchemaEditor } from "./schema-editor";
import { EnumEditor } from "./enum-editor";
import { TableEditor } from "./table-editor";

/**
 * Right side panel: the selected table or enum's editor, or the whole schema's DBML. The header
 * selects or tidies the selected card's linked group (or tidies the whole schema).
 */
export function DbPanel() {
  const engine = useEngine();
  const schema = useBoardSchema();
  const selectedId = useEngineState((state) => state.selectedId);
  const selectionTypes = useEngineState((state) => state.selectionTypes);
  const tableId = selectionTypes === "db-table" ? selectedId : null;
  const enumId = selectionTypes === "db-enum" ? selectedId : null;
  const schemaOpen = useBoardPanelStore((state) => state.schemaOpen);
  const setSchemaOpen = useBoardPanelStore((state) => state.setSchemaOpen);
  if (!schemaOpen && !tableId && !enumId) return null;
  const title = schemaOpen ? "Database schema" : tableId ? "Table" : "Enum";

  const close = () => (schemaOpen ? setSchemaOpen(false) : engine.cancel());
  const cardId = schemaOpen ? null : (tableId ?? enumId);
  const tidy = () => schema.tidy(cardId ? schema.connectedTo(cardId) : undefined);

  return (
    <FloatingPanel
      role="complementary"
      aria-label={schemaOpen ? "Database schema" : `${title} editor`}
      className="max-h-full w-[340px] flex-col items-stretch gap-3 p-3"
    >
      <header className="flex items-center gap-2">
        <h2 className="flex-1 text-sm font-semibold">{title}</h2>
        {cardId && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Select linked"
            title="Select every table and enum linked to this one, to move them"
            onClick={() => engine.select(schema.connectedTo(cardId))}
          >
            <BoxSelect />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Tidy up"
          title={
            cardId ? "Tidy up this table and the ones linked to it" : "Tidy up the whole schema"
          }
          onClick={tidy}
        >
          <LayoutGrid />
        </Button>
        {!schemaOpen && (
          <Button variant="ghost" size="sm" onClick={() => setSchemaOpen(true)}>
            <Braces />
            Schema
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Close panel"
          onClick={close}
        >
          <X />
        </Button>
      </header>
      <div className="-mx-3 flex min-h-0 flex-1 flex-col overflow-y-auto px-3">
        {schemaOpen ? (
          <SchemaEditor />
        ) : tableId ? (
          <TableEditor tableId={tableId} />
        ) : (
          enumId && <EnumEditor enumId={enumId} />
        )}
      </div>
    </FloatingPanel>
  );
}
