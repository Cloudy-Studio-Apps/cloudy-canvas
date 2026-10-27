import { useState } from "react";
import { FileDown, FileUp } from "lucide-react";

import type { DbmlError } from "../../schema/dbml/parser.types";
import { useCanvasFile } from "@canvas-ui";
import { exportDbmlFile, importDbmlFile } from "@platform";
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
    const text = await importDbmlFile();
    if (text === null) return;
    const result = schema.importSchemaDbml(text);
    setImportError(result.ok ? null : result.error);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={() => void importFile().catch(console.error)}>
          <FileUp />
          {t("schemaEditor.import")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void exportDbmlFile(schema.schemaDbml(), file.name).catch(console.error)}
        >
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
