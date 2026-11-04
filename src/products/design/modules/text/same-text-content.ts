import { sameRunStyle } from "@canvas";

import type { TextNodeRun } from "./text.types";

/** Whether a text and its (normalized) runs are the same as another's. */
export function sameTextContent(
  text: string,
  runs: readonly TextNodeRun[],
  otherText: string,
  otherRuns: readonly TextNodeRun[],
): boolean {
  return (
    text === otherText &&
    runs.length === otherRuns.length &&
    runs.every((run, i) => {
      const own = otherRuns[i];
      return (
        own && own.start === run.start && own.end === run.end && sameRunStyle(own.style, run.style)
      );
    })
  );
}
