import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/kit";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { useBoardSchema, useDbTable } from "../schema";
import { DbmlEditor } from "./dbml-editor";
import { TableVisualEditor } from "./table-visual-editor";
import type { TableEditorProps } from "./table-editor.types";
import { t } from "../../db.i18n";

/** One table's slice of the schema, as a form or as DBML. Both edit the same board schema. */
export function TableEditor({ tableId }: TableEditorProps) {
  const schema = useBoardSchema();
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
        <TabsTrigger value="visual">{t("tabs.visual")}</TabsTrigger>
        <TabsTrigger value="dbml">DBML</TabsTrigger>
      </TabsList>
      <TabsContent value="visual">
        <TableVisualEditor table={table} />
      </TabsContent>
      <TabsContent value="dbml" className="flex min-h-0 flex-col">
        <DbmlEditor
          key={tableId}
          label={t("tableEditor.dbmlLabel", { name: table.name })}
          hint={t("tableEditor.dbmlHint")}
          read={() => schema.tableDbml(tableId)}
          apply={(text, options) => schema.applyTableDbml(tableId, text, options)}
        />
      </TabsContent>
    </Tabs>
  );
}
