import type { Path64 } from "clipper2-ts";

import type { Point } from "../geometry.types";
import { flatness, subCurve } from "./bezier";
import type { CurveRun, PathContour, PathSegment } from "./path.types";
import { PATH_SCALE } from "./path-precision";
import { lineTo } from "./path-segments";
import type { SourceTags } from "./source-tags";

/**
 * A closed contour from Clipper's integer points, with its source curves back: consecutive edges
 * along one curve, in one direction, become that curve's part between their ends. Edges along no
 * source (where shapes were offset) stay straight.
 */
export function rebuildContour(path: Path64, tags: SourceTags | null, hole: boolean): PathContour {
  const n = path.length;
  const points: Point[] = path.map((p) => ({ x: p.x / PATH_SCALE, y: p.y / PATH_SCALE }));
  const runs = path.map((p, i) => (tags ? runOf(p.z, path[(i + 1) % n]!.z, tags) : null));
  const at = (i: number) => (i + n) % n;
  // Start where a run starts, so none wraps round the contour's start.
  const start = Math.max(
    0,
    runs.findIndex((run, i) => !continues(runs[at(i - 1)] ?? null, run)),
  );

  const segments: PathSegment[] = [];
  for (let i = 0; i < n;) {
    const run = runs[at(start + i)] ?? null;
    const from = points[at(start + i)]!;
    if (!run) {
      segments.push(lineTo(from, points[at(start + i + 1)]!));
      i++;
      continue;
    }
    let t1 = run.t1;
    let j = i + 1;
    while (j < n && continues(runs[at(start + j - 1)] ?? null, runs[at(start + j)] ?? null)) {
      t1 = runs[at(start + j)]!.t1;
      j++;
    }
    const [, c1, c2] = subCurve(run.curve, run.t0, t1);
    segments.push({ c1, c2, to: points[at(start + j)]! });
    i = j;
  }
  return { start: points[start]!, segments, closed: true, ...(hole ? { hole: true } : {}) };
}

/** The source curve an edge between two tagged points follows (the closest, when several). */
function runOf(
  from: number | undefined,
  to: number | undefined,
  tags: SourceTags,
): CurveRun | null {
  const ends = tags.get(to);
  let best: CurveRun | null = null;
  let bestFlatness = Infinity;
  for (const a of tags.get(from)) {
    for (const b of ends) {
      if (b.curve !== a.curve || a.t === b.t) continue;
      // The edge is a chord of the curve's part between them: the flattest part is the one it is.
      const deviation = flatness(subCurve(a.curve, a.t, b.t));
      if (deviation < bestFlatness) {
        best = { curve: a.curve, t0: a.t, t1: b.t };
        bestFlatness = deviation;
      }
    }
  }
  return best;
}

/** Whether `next` goes on along the same curve, the same way, from where `run` ended. */
function continues(run: CurveRun | null, next: CurveRun | null): boolean {
  return (
    !!run &&
    !!next &&
    run.curve === next.curve &&
    Math.abs(run.t1 - next.t0) < 1e-6 &&
    Math.sign(run.t1 - run.t0) === Math.sign(next.t1 - next.t0)
  );
}
