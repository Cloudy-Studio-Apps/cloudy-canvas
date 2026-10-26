import type { DbmlError } from "../../../db";
import type { ErStandardDefinition } from "../../base/standards";
import { blockRange } from "../block-range";
import { serializeErBlocks, type ErShapes } from "../lang";
import { checkErDiagram } from "./check-er";

/**
 * The constructs the standard forbids that the applied text uses, as warnings on the lines of
 * `text` (the text as typed, which may differ from the diagram's own text): each finding's block
 * is found by its first words (`Union Categoria`, `Entity Alumno`), an attribute by its name below
 * them.
 */
export function standardTextWarnings(
  text: string,
  shapes: ErShapes,
  standard: ErStandardDefinition,
): DbmlError[] {
  const issues = checkErDiagram(shapes, standard).filter((i) => i.rule === "standard-construct");
  if (issues.length === 0) return [];
  const blocks = serializeErBlocks(shapes);
  const lines = text.split("\n");
  const attributes = new Map(shapes.attributes.map((a) => [a.id, a]));
  const warnings = issues.map((issue) => {
    const range = blockRange(blocks, shapes.attributes, issue.shapeId);
    const header = range ? headerWords(blocks.text.slice(range.from, range.to)) : "";
    let line = header ? lines.findIndex((l) => headerWords(l) === header) : -1;
    const attribute = attributes.get(issue.shapeId);
    if (attribute && line >= 0) {
      const name = new RegExp(`(^|[^\\w])${escape(attribute.name)}([^\\w]|$)`);
      const own = lines.findIndex((l, i) => i > line && name.test(l));
      if (own >= 0) line = own;
    }
    return { message: issue.message, line: Math.max(line, 0) + 1, column: 1 };
  });
  return warnings.sort((a, b) => a.line - b.line);
}

/** A block's first two words, lowercased (`entity alumno`), or "" when it has fewer. */
function headerWords(block: string): string {
  const words = (block.split("\n")[0] ?? "")
    .trim()
    .split(/[\s[{]+/)
    .filter(Boolean);
  return words.length >= 2 ? `${words[0]} ${words[1]}`.toLowerCase() : "";
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
