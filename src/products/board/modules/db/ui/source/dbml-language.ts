import { createSourceLanguage } from "@board/ui/components/source-editor";

/** Syntax colors for the DBML the database panel edits. */
export const dbmlLanguage = createSourceLanguage({
  name: "dbml",
  blockKeywords: ["table", "enum", "ref", "note", "indexes", "project", "tablegroup", "as"],
  settings: [
    "pk",
    "primary",
    "key",
    "not",
    "null",
    "unique",
    "increment",
    "default",
    "ref",
    "note",
    "headercolor",
    "type",
    "name",
    "delete",
    "update",
    "cascade",
    "restrict",
    "set",
    "action",
    "no",
  ],
  typeAfterName: true,
});
