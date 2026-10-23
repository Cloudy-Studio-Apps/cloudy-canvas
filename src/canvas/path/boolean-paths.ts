import { Clipper64, ClipType, FillRule, PathType, PolyTree64, type Paths64 } from "clipper2-ts";

import { flattenShape } from "./flatten-path";
import type { PathFillRule, PathOperand, PathOperation, PathShape } from "./path.types";
import { FLATTEN_TOLERANCE } from "./path-precision";
import { SourceTags } from "./source-tags";
import { treeToShape } from "./tree-to-shape";

const EMPTY: PathShape = { contours: [] };

/**
 * Combines shapes as Figma's booleans do, bottom to top: `union` (all of them), `subtract` (the
 * first minus the others), `intersect` (where all overlap) and `exclude` (where an odd number
 * overlap). Each operand is filled by its own rule first. The result is normalized (outers and
 * their holes) and keeps the operands' curves.
 */
export function booleanPaths(
  operation: PathOperation,
  operands: readonly PathOperand[],
  tolerance = FLATTEN_TOLERANCE,
): PathShape {
  const tags = new SourceTags();
  const areas = operands
    .map(({ shape, fillRule }) => filled(flattenShape(shape, tags, tolerance), fillRule, tags))
    .filter((paths) => paths.length > 0);
  const [first, ...rest] = areas;
  if (!first) return EMPTY;
  // Operands that don't fill anything still count: intersecting with nothing leaves nothing.
  if (operation === "intersect" && areas.length < operands.length) return EMPTY;

  let result: Paths64;
  switch (operation) {
    case "union":
      result = clip(ClipType.Union, areas.flat(), [], FillRule.NonZero, tags);
      break;
    case "subtract":
      result = clip(ClipType.Difference, first, rest.flat(), FillRule.NonZero, tags);
      break;
    case "intersect":
      result = rest.reduce(
        (acc, next) => clip(ClipType.Intersection, acc, next, FillRule.NonZero, tags),
        first,
      );
      break;
    case "exclude":
      result = rest.reduce(
        (acc, next) => clip(ClipType.Xor, acc, next, FillRule.NonZero, tags),
        first,
      );
      break;
  }
  return toShape(result, FillRule.NonZero, tags);
}

/**
 * A shape as clean outers and holes, filled by `fillRule` (overlaps merged, self-crossings
 * resolved, curves kept): what vectors draw and hit so their holes show.
 */
export function normalizePath(
  shape: PathShape,
  fillRule: PathFillRule,
  tolerance = FLATTEN_TOLERANCE,
): PathShape {
  const tags = new SourceTags();
  const paths = flattenShape(shape, tags, tolerance);
  return paths.length > 0 ? toShape(paths, ruleOf(fillRule), tags) : EMPTY;
}

/** The area paths fill by their rule, as non-overlapping paths (outers and holes, oriented). */
function filled(paths: Paths64, fillRule: PathFillRule, tags: SourceTags): Paths64 {
  return paths.length > 0 ? clip(ClipType.Union, paths, [], ruleOf(fillRule), tags) : paths;
}

function clip(
  type: ClipType,
  subjects: Paths64,
  clips: Paths64,
  fillRule: FillRule,
  tags: SourceTags,
): Paths64 {
  const clipper = new Clipper64();
  clipper.zCallback = tags.onIntersection;
  clipper.addPaths(subjects, PathType.Subject);
  if (clips.length > 0) clipper.addPaths(clips, PathType.Clip);
  const solution: Paths64 = [];
  clipper.execute(type, fillRule, solution);
  return solution;
}

function toShape(paths: Paths64, fillRule: FillRule, tags: SourceTags): PathShape {
  const clipper = new Clipper64();
  clipper.zCallback = tags.onIntersection;
  clipper.addPaths(paths, PathType.Subject);
  const tree = new PolyTree64();
  clipper.execute(ClipType.Union, fillRule, tree);
  return treeToShape(tree, tags);
}

function ruleOf(fillRule: PathFillRule): FillRule {
  return fillRule === "evenodd" ? FillRule.EvenOdd : FillRule.NonZero;
}
