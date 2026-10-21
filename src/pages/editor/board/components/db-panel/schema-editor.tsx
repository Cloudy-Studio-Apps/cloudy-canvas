import { useState } from "react";
import { FileDown, FileUp } from "lucide-react";

import type { DbmlError } from "@engine";
import { exportDbmlFile, importDbmlFile } from "@platform";
import { Button } from "@ui/components/ui/button";
import { useEngine } from "../../engine/engine-context";
import { useBoardFile } from "../../file";
import { DbmlEditor } from "./dbml-editor";

/** The whole board schema as DBML. New tables appear next to the content; removed ones are deleted. */
export function SchemaEditor() {
  const engine = useEngine();
  const file = useBoardFile();
  const [importError, setImportError] = useState<DbmlError | null>(null);

  const importFile = async () => {
    const text = await importDbmlFile();
    if (text === null) return;
    const result = engine.db.importSchemaDbml(text);
    setImportError(result.ok ? null : result.error);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={() => void importFile().catch(console.error)}>
          <FileUp />
          Import .dbml
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            void exportDbmlFile(engine.db.schemaDbml(), file.name).catch(console.error)
          }
        >
          <FileDown />
          Export .dbml
        </Button>
      </div>
      {importError && (
        <p role="alert" className="text-xs text-destructive">
          Import failed, line {importError.line}: {importError.message}
        </p>
      )}
      <DbmlEditor
        label="Board schema DBML"
        hint="Every table, enum and DBML sticky note on the board. Paste a full schema here to replace it; Import merges a file in."
        read={() => engine.db.schemaDbml()}
        apply={(text) => engine.db.applySchemaDbml(text)}
      />
    </div>
  );
}
