import { spliceRuns } from "@canvas";

import type { DataTemplate } from "./binding.types";

/**
 * A template with its text replaced by `next`, its style runs following the change as typing
 * does: the one changed stretch (what lies between the common start and end) is spliced.
 */
export function editTemplate(template: DataTemplate, next: string): DataTemplate {
  const prev = template.text;
  let start = 0;
  while (start < prev.length && start < next.length && prev[start] === next[start]) start++;
  let end = 0;
  while (
    end < prev.length - start &&
    end < next.length - start &&
    prev[prev.length - 1 - end] === next[next.length - 1 - end]
  )
    end++;
  const removed = prev.length - start - end;
  const inserted = next.length - start - end;
  return {
    text: next,
    runs: spliceRuns(template.runs, start, removed, inserted, next.length),
  };
}
