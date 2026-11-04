import type { TextNodeRun } from "../../text";
import type { DataTemplate } from "./binding.types";
import { checkTemplate } from "./bind-data-checks";
import { parseTokens } from "./parse-tokens";
import { renamePath } from "./rename-path";

/**
 * The template with `from` renamed to `to` in its tokens, or `null` when no token names it. The
 * text between tokens is copied as it is; the runs move with their text (a run that touched a
 * token now covers the whole renamed token), clipped so they stay sorted, in range and apart.
 * Never throws: a stored template that breaks `bindData`'s rules (an older or hand-made file) is
 * left as it is (`null`), so one bad layer never stops a rename halfway.
 */
export function renameTemplate(
  template: DataTemplate,
  from: string,
  to: string,
): DataTemplate | null {
  if (!valid(template)) return null;
  const source = template.text;
  // Each changed token: where it was and where it is now.
  const moved: { start: number; end: number; newStart: number; newEnd: number }[] = [];
  let out = "";
  let at = 0;
  for (const part of parseTokens(source)) {
    if (part.kind !== "token") continue;
    const expr = renamePath(part.expr, from, to);
    if (expr === null) continue;
    out += source.slice(at, part.start);
    const newStart = out.length;
    out += `{${expr}}`;
    moved.push({ start: part.start, end: part.end, newStart, newEnd: out.length });
    at = part.end;
  }
  if (moved.length === 0) return null;
  out += source.slice(at);

  const map = (offset: number, edge: "start" | "end"): number => {
    let delta = 0;
    for (const m of moved) {
      if (offset >= m.end) delta = m.newEnd - m.end;
      else if (offset > m.start) return edge === "start" ? m.newStart : m.newEnd;
      else break;
    }
    return offset + delta;
  };
  // A run edge inside a renamed token moves to the token's edge, so neighbours could overlap:
  // each run starts where the one before it ends at the earliest, and empty ones go.
  const runs: TextNodeRun[] = [];
  let last = 0;
  for (const run of [...template.runs].sort((a, b) => a.start - b.start)) {
    const start = Math.max(map(run.start, "start"), last);
    const end = Math.min(map(run.end, "end"), out.length);
    if (end <= start) continue;
    runs.push({ ...run, start, end });
    last = end;
  }
  const renamed = { text: out, runs };
  // The same rules `bindData` holds a template to (sorted, apart, inside the text).
  return valid(renamed) ? renamed : null;
}

function valid(template: DataTemplate): boolean {
  try {
    checkTemplate(template);
    return true;
  } catch {
    return false;
  }
}
