import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/kit";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { useBoardSchema, useDbEnum } from "../schema";
import { DbmlEditor } from "./dbml-editor";
import { EnumVisualEditor } from "./enum-visual-editor";
import type { EnumEditorProps } from "./enum-editor.types";
import { t } from "../../db.i18n";

/** One enum's slice of the schema, as a form or as DBML. */
export function EnumEditor({ enumId }: EnumEditorProps) {
  const schema = useBoardSchema();
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
        <TabsTrigger value="visual">{t("tabs.visual")}</TabsTrigger>
        <TabsTrigger value="dbml">DBML</TabsTrigger>
      </TabsList>
      <TabsContent value="visual">
        <EnumVisualEditor target={target} />
      </TabsContent>
      <TabsContent value="dbml" className="flex min-h-0 flex-col">
        <DbmlEditor
          key={enumId}
          label={t("enumEditor.dbmlLabel", { name: target.name })}
          hint={t("enumEditor.dbmlHint")}
          read={() => schema.enumDbml(enumId)}
          apply={(text) => schema.applyEnumDbml(enumId, text)}
        />
      </TabsContent>
    </Tabs>
  );
}
