import type { TextNodeRun } from "../../text";
import { parseTokens } from "./parse-tokens";
import type { DataTemplate } from "./binding.types";
import type { ResolvedTemplate } from "./resolve-template.types";

/**
 * Fills a template's tokens and keeps its styling: text outside tokens keeps its runs, a token's
 * output takes the style of the run holding its `{`. `resolve` gives the text of an expression, or
 * `null` when it can't be read (written as empty and listed in `missing`).
 */
export function resolveRichTemplate(
  template: DataTemplate,
  resolve: (expr: string) => string | null,
): ResolvedTemplate {
  const source = template.text;
  // Where each source offset lands in the output, for a run that starts there and for one that ends there.
  const startMap = new Array<number>(source.length + 1).fill(0);
  const endMap = new Array<number>(source.length + 1).fill(0);
  const missing: string[] = [];
  let out = "";
  let allEmpty = true;
  let textIsBlank = true;

  for (const part of parseTokens(source)) {
    if (part.kind === "token") {
      const value = resolve(part.expr);
      if (value === null) missing.push(part.expr);
      const piece = value ?? "";
      if (piece) allEmpty = false;
      const from = out.length;
      out += piece;
      startMap[part.start] = from;
      endMap[part.start] = from;
      for (let i = part.start + 1; i <= part.end; i++) {
        startMap[i] = out.length;
        endMap[i] = out.length;
      }
      continue;
    }
    if (part.text.trim()) textIsBlank = false;
    let i = part.start;
    while (i < part.end) {
      startMap[i] = out.length;
      endMap[i] = out.length;
      if (source[i] === "{" && source[i + 1] === "{") {
        out += "{";
        startMap[i + 1] = out.length;
        endMap[i + 1] = out.length;
        i += 2;
      } else {
        out += source[i];
        i++;
      }
      endMap[i] = out.length;
      startMap[i] = out.length;
    }
  }

  const runs: TextNodeRun[] = [];
  let last = 0;
  for (const run of [...template.runs].sort((a, b) => a.start - b.start)) {
    const start = Math.max(startMap[clampIndex(run.start, source.length)] ?? 0, last);
    const end = Math.min(endMap[clampIndex(run.end, source.length)] ?? 0, out.length);
    if (end <= start) continue;
    runs.push({ ...run, start, end });
    last = end;
  }
  return { text: out, runs, empty: allEmpty && textIsBlank, missing };
}

function clampIndex(value: number, max: number): number {
  return Math.min(Math.max(Math.trunc(value) || 0, 0), max);
}
