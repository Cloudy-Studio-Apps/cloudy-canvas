import { isText } from "../text";
import { nodePaintStacks, type DesignNode } from "../core";
import { paintColorPaths } from "./paint-color-paths";

/**
 * Every color path of a node that isn't bound to a variable or a style: its fills, strokes,
 * vectors' areas' own fills and texts' ranges' fills. Bound ones follow their variable or style,
 * so they are changed there.
 */
export function nodeColorPaths(node: DesignNode): string[] {
  const paths = nodePaintStacks(node).flatMap(({ path, paints }) => paintColorPaths(path, paints));
  if (isText(node)) {
    node.runs.forEach((run, i) => {
      if (run.style.fills) paths.push(...paintColorPaths(`runs.${i}.style.fills`, run.style.fills));
    });
  }
  const bound = Object.keys(node.bindings ?? {});
  return paths.filter((path) => !bound.some((b) => path === b || path.startsWith(`${b}.`)));
}
