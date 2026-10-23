import { erStandard } from "../base/er-notation";
import type { ErStandardDefinition } from "../base/standards";
import { constructGate } from "../base/constructs";
import type { ErConstructGate } from "../base/constructs";
import type { ErShapes } from "./lang";

/** The standard a diagram follows (its shapes carry it; the default when it has none). */
export function standardOf(shapes: ErShapes): ErStandardDefinition {
  const { entities, relations, attributes } = shapes;
  return erStandard([...entities, ...relations, ...attributes][0]?.notation);
}

/** What the diagram's standard lets the editor add. */
export function gateOf(shapes: ErShapes): ErConstructGate {
  return constructGate(standardOf(shapes));
}
