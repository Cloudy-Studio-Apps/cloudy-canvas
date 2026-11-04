import { layoutOf, type DesignNode } from "../../core";
import { isText, RUN_STYLE_PREFIX, TEXT_STYLE_PATH } from "../../text";
import { dataFieldsOf, replacedPath } from "../bindings";

/** Bindings a text lays itself out again for (its size follows). */
const RETYPESET = new Set([
  "text",
  "fontSize",
  "lineHeight",
  "letterSpacing",
  "fontWeight",
  "fontFamily",
  "fontStyle",
  TEXT_STYLE_PATH,
]);

/**
 * The paths of a layer that its data writes (`planBindings`), which a copy keeps as its row gave
 * them: its `dataBindings` keys (a picture's whole paint), what their kinds' `bindPatch` derives
 * (a bound size's sizing, a side's stroke the widest, a turn's position, a bound text's laid-out
 * size and runs), `text` and `runs` from `dataText`, and `visible` from a show rule.
 */
export function dataResolvedPaths(node: DesignNode): string[] {
  const fields = dataFieldsOf(node);
  const paths: string[] = [];
  let laysOut = false;
  if (fields.dataText) {
    paths.push("text", "runs");
    laysOut = true;
  }
  for (const key of Object.keys(fields.dataBindings ?? {})) {
    if (key.startsWith(RUN_STYLE_PREFIX)) {
      paths.push("runs");
      laysOut = true;
      continue;
    }
    paths.push(replacedPath(key));
    if (RETYPESET.has(key)) laysOut = true;
    if (key === "text") paths.push("runs");
    else if (key === "w") paths.push("sizing.h");
    else if (key === "h") paths.push("sizing.v");
    else if (key === "rotation") paths.push("x", "y");
    else if (key.startsWith("strokeWeights.")) paths.push("strokeWeight");
  }
  if (laysOut && isText(node)) {
    if (node.autoResize !== "none") paths.push("h");
    if (node.autoResize === "width") paths.push("w", "x");
  }
  if (fields.dataVisible || fields.dataHideEmpty) paths.push("visible");
  return paths;
}

/**
 * The paths an auto layout decides for a layer, which a copy keeps since its own layout (with its
 * own row's content) places it: its position and a filled side inside a layout parent, and a
 * hugged side of its own layout.
 */
export function layoutPlacedPaths(node: DesignNode, parent: DesignNode | null): string[] {
  const paths: string[] = [];
  if (parent && layoutOf(parent) && !node.layoutAbsolute) {
    paths.push("x", "y");
    if (node.sizing.h === "fill") paths.push("w");
    if (node.sizing.v === "fill") paths.push("h");
  }
  if (layoutOf(node)) {
    if (node.sizing.h === "hug") paths.push("w");
    if (node.sizing.v === "hug") paths.push("h");
  }
  return paths;
}
