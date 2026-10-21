import { useBoardPanelStore } from "@stores/board-panel-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/ui/tabs";
import { useEngine } from "../../engine/engine-context";
import { useDbEnum } from "../../engine/use-db-table";
import { DbmlEditor } from "./dbml-editor";
import { EnumVisualEditor } from "./enum-visual-editor";
import type { EnumEditorProps } from "./enum-editor.types";

/** One enum's slice of the schema, as a form or as DBML. */
export function EnumEditor({ enumId }: EnumEditorProps) {
  const engine = useEngine();
  const target = useDbEnum(enumId);
  const tab = useBoardPanelStore((state) => state.tableTab);
  const setTab = useBoardPanelStore((state) => state.setTableTab);
  if (!target) return null;

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
        <EnumVisualEditor target={target} />
      </TabsContent>
      <TabsContent value="dbml" className="flex min-h-0 flex-col">
        <DbmlEditor
          key={enumId}
          label={`DBML for ${target.name}`}
          hint="Only this enum. Renaming it also renames the type of the columns that use it."
          read={() => engine.db.enumDbml(enumId)}
          apply={(text) => engine.db.applyEnumDbml(enumId, text)}
        />
      </TabsContent>
    </Tabs>
  );
}
