import type { CompletionContext } from "@codemirror/autocomplete";

import type { SourceContext } from "./source-context.types";

const WORD_BEFORE = /[\p{L}\p{N}_.]*$/u;
const WORD = /[\p{L}\p{N}_."'`#]+/gu;
const FIRST_WORD = /^\s*([\p{L}_][\p{L}\p{N}_]*)/u;

/** Reads the cursor's surroundings: the blocks it's in, the settings and the words before it. */
export function readSourceContext(context: CompletionContext): SourceContext {
  const line = context.state.doc.lineAt(context.pos);
  const before = line.text.slice(0, context.pos - line.from);
  const word = context.matchBefore(WORD_BEFORE);
  const from = word?.from ?? context.pos;
  const open = before.lastIndexOf("[");
  const inSettings = open > before.lastIndexOf("]");
  const lineStart = before.lastIndexOf("{") + 1;
  const plain = before
    .slice(lineStart, from - line.from)
    .replace(/\[[^\]]*\]?/g, " ")
    .replace(/\/\/.*$/, "");
  return {
    before,
    from,
    typed: word?.text ?? "",
    blocks: openBlocks(context.state.sliceDoc(0, context.pos)),
    inSettings,
    settings: inSettings ? before.slice(open + 1) : "",
    wordsBefore: plain.match(WORD) ?? [],
  };
}

/** The keyword of every `{` still open at the end of `text`, skipping strings and comments. */
function openBlocks(text: string): string[] {
  const blocks: string[] = [];
  let lineStart = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\n") lineStart = i + 1;
    else if (text.startsWith("//", i)) i = endOf(text, "\n", i) - 1;
    else if (text.startsWith("/*", i)) i = endOf(text, "*/", i + 2) + 1;
    else if (text.startsWith("'''", i)) i = endOf(text, "'''", i + 3) + 2;
    else if (ch === "'" || ch === '"' || ch === "`") i = endOf(text, ch, i + 1);
    else if (ch === "{") {
      const head = text.slice(lineStart, i);
      blocks.push(head.match(FIRST_WORD)?.[1]?.toLowerCase() ?? "");
    } else if (ch === "}") blocks.pop();
  }
  return blocks;
}

/** Index of `end` at or after `from`, or the text's length when it isn't closed. */
function endOf(text: string, end: string, from: number): number {
  const at = text.indexOf(end, from);
  return at === -1 ? text.length : at;
}
