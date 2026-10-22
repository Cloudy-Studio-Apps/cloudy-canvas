import { createSourceLanguage } from "./stream-language";

/** Syntax colors for the ER diagram text (`docs/er-language.md`). */
export const erLanguage = createSourceLanguage({
  name: "er",
  blockKeywords: ["entity", "relation", "isa", "aggregate", "constraint", "diagram", "attr"],
  settings: [
    "pk",
    "key",
    "weak",
    "multi",
    "multivalued",
    "derived",
    "optional",
    "identifying",
    "id",
    "total",
    "partial",
    "exclusive",
    "overlapping",
    "inclusive",
    "exclusion",
    "inclusion",
    "arrow",
    "style",
    "chen",
    "lollipop",
    "ellipse",
    "color",
    "n",
    "by",
  ],
});
