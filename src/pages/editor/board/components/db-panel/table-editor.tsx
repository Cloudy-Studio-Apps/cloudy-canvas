import { useBoardPanelStore } from "@stores/board-panel-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/ui/tabs";
import { useEngine } from "../../engine/engine-context";
import { useDbTable } from "../../engine/use-db-table";
import { DbmlEditor } from "./dbml-editor";
import { TableVisualEditor } from "./table-visual-editor";
import type { TableEditorProps } from "./table-editor.types";

/** One table's slice of the schema, as a form or as DBML. Both edit the same board schema. */
export function TableEditor({ tableId }: TableEditorProps) {
  const engine = useEngine();
  const table = useDbTable(tableId);
  const tab = useBoardPanelStore((state) => state.tableTab);
  const setTab = useBoardPanelStore((state) => state.setTableTab);
  if (!table) return null;

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value === "dbml" ? "dbml" : "visual")}
      className="min-h-0 flex-1"
    >
      <TabsList className="w-full">
        <TabsTrigger value="visual">Visual</TabsTrigger>
        <TabsTrigger value="dbml">DBML</TabsTrigger>
      </TabsList>
      <TabsContent value="visual">
        <TableVisualEditor table={table} />
      </TabsContent>
      <TabsContent value="dbml" className="flex min-h-0 flex-col">
        <DbmlEditor
          key={tableId}
          label={`DBML for ${table.name}`}
          hint="Only this table. Refer to other tables by name, e.g. [ref: > users.id]."
          read={() => engine.db.tableDbml(tableId)}
          apply={(text, options) => engine.db.applyTableDbml(tableId, text, options)}
        />
      </TabsContent>
    </Tabs>
  );
}
