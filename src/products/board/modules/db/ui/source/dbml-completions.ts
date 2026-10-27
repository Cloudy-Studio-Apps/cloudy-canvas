import { snippetCompletion } from "@codemirror/autocomplete";
import type { Completion, CompletionContext, CompletionSource } from "@codemirror/autocomplete";

import {
  completionResult,
  definedNames,
  nameOptions,
  readSourceContext,
  startingWith,
  writtenName,
  type SourceContext,
} from "@board/ui/components/source-editor";
import { COLUMN_TYPES } from "../../schema";
import type { DbmlNames } from "./dbml-completions.types";

const TOP_LEVEL: Completion[] = [
  snippetCompletion("Table ${name} {\n\t${}\n}", {
    label: "Table",
    type: "keyword",
    detail: "table",
  }),
  snippetCompletion("Enum ${name} {\n\t${}\n}", { label: "Enum", type: "keyword", detail: "enum" }),
  snippetCompletion("Ref: ${from} > ${to}", { label: "Ref", type: "keyword", detail: "relation" }),
];

const IN_TABLE: Completion[] = [
  snippetCompletion("Note: '${}'", { label: "Note", type: "keyword", detail: "table note" }),
  snippetCompletion("indexes {\n\t${}\n}", { label: "indexes", type: "keyword" }),
];

const COLUMN_SETTINGS: Completion[] = [
  { label: "pk", type: "constant", detail: "primary key" },
  { label: "not null", type: "constant" },
  { label: "null", type: "constant" },
  { label: "unique", type: "constant" },
  { label: "increment", type: "constant" },
  snippetCompletion("default: ${}", { label: "default", type: "constant" }),
  snippetCompletion("ref: > ${}", { label: "ref", type: "constant", detail: "many-to-one" }),
  snippetCompletion("note: '${}'", { label: "note", type: "constant" }),
];

const INDEX_SETTINGS: Completion[] = [
  { label: "pk", type: "constant" },
  { label: "unique", type: "constant" },
  snippetCompletion("name: '${}'", { label: "name", type: "constant" }),
  snippetCompletion("type: ${}", { label: "type", type: "constant" }),
];

const TYPES: Completion[] = COLUMN_TYPES.map((label) => ({ label, type: "type", detail: "type" }));

/** `ref: > users.id` inside settings, or the right side of a `Ref:` line. */
const REF_IN_SETTINGS = /\bref\s*:\s*[<>\-~]*\s*[\p{L}\p{N}_."]*$/iu;
const REF_LINE = /^\s*ref\b[^:]*:/i;

/**
 * Completions for DBML: block keywords, column types and enums, column settings, and
 * `table.column` targets for relations. `names` is read on every request, so it stays current.
 */
export function dbmlCompletions(names: () => DbmlNames): CompletionSource {
  return (context: CompletionContext) => {
    const at = readSourceContext(context);
    const options = optionsAt(at, context, names);
    if (!options) return null;
    return completionResult(at, options);
  };
}

function optionsAt(
  at: SourceContext,
  context: CompletionContext,
  names: () => DbmlNames,
): Completion[] | null {
  const block = at.blocks.at(-1);
  const wantsList = at.typed !== "" || context.explicit;

  if (at.inSettings) {
    if (REF_IN_SETTINGS.test(at.settings)) return refTargets(names(), context);
    // A setting's value (`default: 0`) has nothing to offer.
    if (at.settings.split(",").at(-1)?.includes(":")) return null;
    return block === "indexes" ? INDEX_SETTINGS : COLUMN_SETTINGS;
  }
  if (block === "ref" || (block === undefined && REF_LINE.test(at.before))) {
    return wantsList ? refTargets(names(), context) : null;
  }
  if (block === undefined) return at.wordsBefore.length === 0 && wantsList ? TOP_LEVEL : null;
  if (block === "table") {
    if (at.wordsBefore.length === 0) return wantsList ? startingWith(IN_TABLE, at.typed) : null;
    if (at.wordsBefore.length === 1) return [...TYPES, ...enumOptions(names(), context)];
  }
  return null;
}

function refTargets(names: DbmlNames, context: CompletionContext): Completion[] {
  const tables = withTextTables(names, context);
  return tables.flatMap((table) => {
    const prefix = writtenName(table.name);
    return [
      { label: table.name, apply: prefix, type: "class", detail: "table" },
      ...table.columns.map((column) => ({
        label: `${table.name}.${column}`,
        apply: `${prefix}.${writtenName(column)}`,
        type: "property",
        detail: "column",
      })),
    ];
  });
}

function enumOptions(names: DbmlNames, context: CompletionContext): Completion[] {
  const text = context.state.doc.toString();
  return nameOptions([...names.enums, ...definedNames(text, ["enum"])], "enum", "enum");
}

/** The schema's tables plus those only the text defines so far (no columns known for them). */
function withTextTables(names: DbmlNames, context: CompletionContext): DbmlNames["tables"] {
  const known = new Set(names.tables.map((table) => table.name));
  const typed = definedNames(context.state.doc.toString(), ["table"])
    .filter((name) => !known.has(name))
    .map((name) => ({ name, columns: [] }));
  return [...names.tables, ...typed];
}
