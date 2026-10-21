import type { SourceRange } from "./source-editor.types";
import type { LineSpan } from "./text-lines.types";

/** The lines `range` covers in `text` (0-based first line and a count of at least one). */
export function lineSpan(text: string, range: SourceRange): LineSpan {
  const first = countLines(text.slice(0, range.from)) - 1;
  return { first, count: countLines(text.slice(range.from, range.to)) };
}

function countLines(text: string): number {
  let lines = 1;
  for (const char of text) if (char === "\n") lines++;
  return lines;
}
