import { useState } from "react";
import { FileDown, FileUp } from "lucide-react";

import type { DbmlError } from "../../schema/dbml/parser.types";
import { useCanvasFile } from "@canvas-ui";
import { exportFile, openFile } from "@platform";
import { notifyError } from "@shared/stores/toast-store";
import { Button } from "@shared/ui/kit";
import { useBoardSchema } from "../schema";
import { DbmlEditor } from "./dbml-editor";
import { t } from "../../db.i18n";

/** The whole board schema as DBML. New tables appear next to the content; removed ones are deleted. */
export function SchemaEditor() {
  const schema = useBoardSchema();
  const file = useCanvasFile();
  const [importError, setImportError] = useState<DbmlError | null>(null);

  const importFile = async () => {
    try {
      const picked = await openFile({
        title: t("schemaEditor.dialogTitle"),
        filters: [{ name: t("schemaEditor.fileType"), extensions: ["dbml"] }],
      });
      if (!picked) return;
      const result = schema.importSchemaDbml(new TextDecoder().decode(picked.bytes));
      setImportError(result.ok ? null : result.error);
    } catch (error) {
      notifyError(t("schemaEditor.readFailed"), error);
    }
  };
  const exportSchema = async () => {
    try {
      const text = new Blob([schema.schemaDbml()], { type: "text/plain" });
      await exportFile(text, file.name, { extension: "dbml", label: t("schemaEditor.fileType") });
    } catch (error) {
      notifyError(t("schemaEditor.exportFailed"), error);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={() => void importFile()}>
          <FileUp />
          {t("schemaEditor.import")}
        </Button>
        <Button variant="outline" size="sm" onClick={() => void exportSchema()}>
          <FileDown />
          {t("schemaEditor.export")}
        </Button>
      </div>
      {importError && (
        <p role="alert" className="text-xs text-destructive">
          {t("schemaEditor.importFailed", { line: importError.line, message: importError.message })}
        </p>
      )}
      <DbmlEditor
        label={t("schemaEditor.label")}
        hint={t("schemaEditor.hint")}
        read={() => schema.schemaDbml()}
        apply={(text, options) => schema.applySchemaDbml(text, options)}
      />
    </div>
  );
}
