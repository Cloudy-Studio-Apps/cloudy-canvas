import { Braces, X } from "lucide-react";

import { useBoardPanelStore } from "@stores/board-panel-store";
import { Button } from "@ui/components/ui/button";
import { useEngine, useEngineState } from "../../engine/engine-context";
import { FloatingPanel } from "../floating-panel";
import { SchemaEditor } from "./schema-editor";
import { EnumEditor } from "./enum-editor";
import { TableEditor } from "./table-editor";

/** Right side panel: the selected table or enum's editor, or the whole schema's DBML. */
export function DbPanel() {
  const engine = useEngine();
  const tableId = useEngineState((state) => state.selectedTableId);
  const enumId = useEngineState((state) => state.selectedEnumId);
  const schemaOpen = useBoardPanelStore((state) => state.schemaOpen);
  const setSchemaOpen = useBoardPanelStore((state) => state.setSchemaOpen);
  if (!schemaOpen && !tableId && !enumId) return null;
  const title = schemaOpen ? "Database schema" : tableId ? "Table" : "Enum";

  const close = () => (schemaOpen ? setSchemaOpen(false) : engine.cancel());

  return (
    <FloatingPanel
      role="complementary"
      aria-label={schemaOpen ? "Database schema" : `${title} editor`}
      className="max-h-full w-[340px] flex-col items-stretch gap-3 p-3"
    >
      <header className="flex items-center gap-2">
        <h2 className="flex-1 text-sm font-semibold">{title}</h2>
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
