import { useDbVersion } from "../../schema";
import { SourceEditor } from "../source-editor";
import type { DbmlEditorProps } from "./dbml-editor.types";

/**
 * DBML text view of the document. Tables that refs name but nothing defines are only created for
 * pasted text and on blur, so half-typed names don't turn into tables.
 */
export function DbmlEditor({ read, apply, label, hint }: DbmlEditorProps) {
  const version = useDbVersion();
  return (
    <SourceEditor
      version={version}
      read={read}
      apply={(text, commit) => apply(text, { createMissingTables: commit })}
      label={label}
      hint={hint}
    />
  );
}
