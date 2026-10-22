import { useMemo } from "react";

import { useBoardSchema, useDbVersion } from "../schema";
import { dbmlCompletions, dbmlLanguage, SourceEditor } from "@board/ui/components/source-editor";
import type { DbmlEditorProps } from "./dbml-editor.types";

/**
 * DBML text view of the document. Tables that refs name but nothing defines are only created for
 * pasted text and on blur, so half-typed names don't turn into tables. Completions offer the
 * board schema's tables, columns and enums.
 */
export function DbmlEditor({ read, apply, label, hint }: DbmlEditorProps) {
  const schema = useBoardSchema();
  const version = useDbVersion();
  const completions = useMemo(
    () =>
      dbmlCompletions(() => ({
        tables: schema.tables().map((table) => ({
          name: table.name,
          columns: table.columns.map((column) => column.name),
        })),
        enums: schema.enums().map((target) => target.name),
      })),
    [schema],
  );
  return (
    <SourceEditor
      version={version}
      read={read}
      apply={(text, commit) => apply(text, { createMissingTables: commit })}
      label={label}
      language={dbmlLanguage}
      completions={completions}
      hint={hint}
    />
  );
}
