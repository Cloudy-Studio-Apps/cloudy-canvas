import type { TextRun } from "./text-run.types";

/** Whether two run styles are the same (same fields with the same values). */
export function sameRunStyle(a: object, b: object): boolean {
  return JSON.stringify(sortedEntries(a)) === JSON.stringify(sortedEntries(b));
}

/**
 * Runs as they're stored: inside the text, sorted, without overlaps, empty ranges or empty
 * styles, and neighbours with the same style merged.
 */
export function normalizeRuns<S extends object>(
  runs: readonly TextRun<S>[],
  length: number,
): TextRun<S>[] {
  const sorted = runs
    .map((run) => ({
      start: clamp(run.start, length),
      end: clamp(run.end, length),
      style: withoutUndefined(run.style),
    }))
    .filter((run) => run.end > run.start && Object.keys(run.style).length > 0)
    .sort((a, b) => a.start - b.start);
  const result: TextRun<S>[] = [];
  for (const run of sorted) {
    const last = result[result.length - 1];
    const start = last ? Math.max(run.start, last.end) : run.start;
    if (start >= run.end) continue;
    if (last && last.end === start && sameRunStyle(last.style, run.style)) last.end = run.end;
    else result.push({ ...run, start });
  }
  return result;
}

/**
 * The runs after `removed` characters at `at` were replaced by `inserted` ones: runs after the
 * change move, runs across it shrink, and inserted text takes the style of the character before
 * it (of the one after it at the very start), as typing does.
 */
export function spliceRuns<S extends object>(
  runs: readonly TextRun<S>[],
  at: number,
  removed: number,
  inserted: number,
  length: number,
): TextRun<S>[] {
  const end = at + removed;
  const shift = inserted - removed;
  const styleIndex = at > 0 ? at - 1 : end;
  const host = runs.find((run) => run.start <= styleIndex && styleIndex < run.end);
  const next: TextRun<S>[] = [];
  for (const run of runs) {
    // The part before the change, and the part after it, moved.
    if (run.start < at) next.push({ ...run, end: Math.min(run.end, at) });
    if (run.end > end)
      next.push({ ...run, start: Math.max(run.start, end) + shift, end: run.end + shift });
  }
  if (host && inserted > 0) next.push({ start: at, end: at + inserted, style: host.style });
  return normalizeRuns(next, length);
}

/** The runs with `patch` laid over characters `start` to `end` (`undefined` fields are cleared). */
export function styleRuns<S extends object>(
  runs: readonly TextRun<S>[],
  start: number,
  end: number,
  patch: Partial<S>,
  length: number,
): TextRun<S>[] {
  if (end <= start) return normalizeRuns(runs, length);
  const cuts = new Set([start, end]);
  for (const run of runs) {
    if (run.start > start && run.start < end) cuts.add(run.start);
    if (run.end > start && run.end < end) cuts.add(run.end);
  }
  const points = [...cuts].sort((a, b) => a - b);
  const next: TextRun<S>[] = [];
  for (const run of runs) {
    if (run.start < start) next.push({ ...run, end: Math.min(run.end, start) });
    if (run.end > end) next.push({ ...run, start: Math.max(run.start, end) });
  }
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    const own = runs.find((run) => run.start <= a && b <= run.end)?.style ?? ({} as S);
    next.push({ start: a, end: b, style: { ...own, ...patch } as S });
  }
  return normalizeRuns(next, length);
}

/** The runs without these style fields (the whole text took them). */
export function clearRunFields<S extends object>(
  runs: readonly TextRun<S>[],
  fields: readonly string[],
  length: number,
): TextRun<S>[] {
  return normalizeRuns(
    runs.map((run) => {
      const style = { ...run.style } as Record<string, unknown>;
      for (const field of fields) delete style[field];
      return { ...run, style: style as S };
    }),
    length,
  );
}

/** The style of the run holding character `index` (an empty one outside every run). */
export function runStyleAt<S extends object>(
  runs: readonly TextRun<S>[],
  index: number,
): Partial<S> {
  return runs.find((run) => run.start <= index && index < run.end)?.style ?? {};
}

/**
 * Where `before` became `after`: the first changed index, how many characters went and how
 * many came (the common start and end are kept).
 */
export function textChange(
  before: string,
  after: string,
): { at: number; removed: number; inserted: number } {
  let start = 0;
  const shortest = Math.min(before.length, after.length);
  while (start < shortest && before[start] === after[start]) start++;
  let end = 0;
  while (
    end < shortest - start &&
    before[before.length - 1 - end] === after[after.length - 1 - end]
  ) {
    end++;
  }
  return { at: start, removed: before.length - start - end, inserted: after.length - start - end };
}

/** The runs of `before` moved onto `after`, the changed part styled as typing does. */
export function runsForText<S extends object>(
  runs: readonly TextRun<S>[],
  before: string,
  after: string,
): TextRun<S>[] {
  if (runs.length === 0 || before === after) return normalizeRuns(runs, after.length);
  const { at, removed, inserted } = textChange(before, after);
  return spliceRuns(runs, at, removed, inserted, after.length);
}

function clamp(value: number, length: number): number {
  return Math.min(Math.max(0, Math.round(value)), length);
}

function withoutUndefined<S extends object>(style: S): S {
  return Object.fromEntries(Object.entries(style).filter(([, v]) => v !== undefined)) as S;
}

function sortedEntries(style: object): [string, unknown][] {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}
