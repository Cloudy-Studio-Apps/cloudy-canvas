import { snippetCompletion } from "@codemirror/autocomplete";
import type { Completion, CompletionContext, CompletionSource } from "@codemirror/autocomplete";

import {
  completionResult,
  definedNames,
  nameOptions,
  readSourceContext,
  startingWith,
  type SourceContext,
} from "@board/ui/components/source-editor";
import { entityAttributeNames } from "./entity-attribute-names";
import { notationValues } from "../../model";

const TOP_LEVEL: Completion[] = [
  snippetCompletion("Entity ${name} {\n\t${}\n}", { label: "Entity", type: "keyword" }),
  snippetCompletion("Relation ${name} {\n\t${}\n}", { label: "Relation", type: "keyword" }),
  snippetCompletion("Isa ${parent} {\n\t${}\n}", {
    label: "Isa",
    type: "keyword",
    detail: "hierarchy",
  }),
  snippetCompletion("Union ${category} {\n\t${}\n}", {
    label: "Union",
    type: "keyword",
    detail: "category",
  }),
  snippetCompletion("Aggregate ${name} { ${} }", { label: "Aggregate", type: "keyword" }),
  snippetCompletion("Constraint ${}", { label: "Constraint", type: "keyword" }),
  snippetCompletion("Diagram ${name}", { label: "Diagram", type: "keyword" }),
];

const CONSTRAINT_KINDS: Completion[] = ["exclusive", "inclusive", "exclusion", "inclusion"].map(
  (label) => ({ label, type: "keyword", detail: "constraint" }),
);

const SETTINGS: Completion[] = [
  ...[
    "pk",
    "weak",
    "multi",
    "derived",
    "optional",
    "partial",
    "identifying",
    "id",
    "associative",
    "existence",
    "ak",
  ].map((label) => ({ label, type: "constant" })),
  ...["exclusive", "overlapping", "total", "arrow"].map((label) => ({ label, type: "constant" })),
  snippetCompletion("by: ${}", { label: "by", type: "constant", detail: "discriminator" }),
  snippetCompletion("color: #${}", { label: "color", type: "constant" }),
  snippetCompletion("style: ${}", { label: "style", type: "constant" }),
  ...[
    "standard",
    "cardinality",
    "ratio",
    "participation",
    "isa",
    "crowfeet",
    "dependency",
    "arrows",
    "joins",
  ].map((label) =>
    snippetCompletion(`${label}: \${}`, { label, type: "constant", detail: "notation" }),
  ),
];

/** A participant's name right before a `.`. */
const DOTTED = /("[^"\n]*"|[\p{L}_][\p{L}\p{N}_]*)\.$/u;

const STYLES: Completion[] = ["chen", "lollipop"].map((label) => ({ label, type: "constant" }));

/**
 * Completions for the ER text: block keywords, settings, and the diagram's entities, relations and
 * aggregations where a line names one. Names come from the text itself, which holds the diagram.
 */
export const erCompletions: CompletionSource = (context: CompletionContext) => {
  const at = readSourceContext(context);
  const options = optionsAt(at, context);
  return options ? completionResult(at, options) : null;
};

function optionsAt(at: SourceContext, context: CompletionContext): Completion[] | null {
  const block = at.blocks.at(-1);
  const wantsList = at.typed !== "" || context.explicit;
  const text = () => context.state.doc.toString();
  const entities = () =>
    nameOptions(definedNames(text(), ["entity", "aggregate"]), "class", "entity");
  const relations = () => nameOptions(definedNames(text(), ["relation"]), "function", "relation");

  if (at.inSettings) {
    const current = at.settings.split(",").at(-1) ?? "";
    if (/^\s*style\s*:/i.test(current)) return STYLES;
    const key = /^\s*(\w+)\s*:/.exec(current)?.[1]?.toLowerCase();
    const values = key ? notationValues()[key] : undefined;
    if (values) return values.map((label) => ({ label, type: "constant" }));
    return current.includes(":") ? null : SETTINGS;
  }
  if (block === undefined) {
    const [first, ...rest] = at.wordsBefore.map((word) => word.toLowerCase());
    if (first === undefined) return wantsList ? TOP_LEVEL : null;
    if ((first === "isa" || first === "union") && rest.length === 0) return entities();
    if (first === "constraint") {
      if (at.before.includes(":")) return relations();
      return rest.length === 0 ? CONSTRAINT_KINDS : entities();
    }
    return null;
  }
  // `Cliente.` in a relation: the attribute it joins through.
  const dotted =
    block === "relation"
      ? DOTTED.exec(at.before.slice(0, at.before.length - at.typed.length))
      : null;
  if (dotted?.[1]) {
    const entity = dotted[1].startsWith('"') ? dotted[1].slice(1, -1) : dotted[1];
    return nameOptions(entityAttributeNames(text(), entity), "property", "attribute");
  }
  if (at.wordsBefore.length > 0 || !wantsList) return null;
  // A relation's lines are participants or its own attributes, so a typed name isn't taken over.
  if (block === "relation") {
    return startingWith([...entities(), { label: "attr", type: "keyword" }], at.typed);
  }
  if (block === "isa" || block === "union") return entities();
  if (block === "aggregate") return relations();
  return null;
}
