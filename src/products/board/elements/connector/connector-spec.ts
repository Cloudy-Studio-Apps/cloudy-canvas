import type { ElementBuildContext, ElementSpec } from "@canvas";

import type { ArrowHead, ConnectorEnd, ConnectorStyle } from "./connector.types";
import { SIDES } from "./sides";

const STYLES: readonly ConnectorStyle[] = ["straight", "elbow"];
const HEADS: readonly ArrowHead[] = ["none", "arrow"];

const END_SCHEMA = {
  type: "object",
  description:
    "An end: { shapeId } or { key } (a shape created in the same call) to attach it, " +
    "optionally with side (top/right/bottom/left), or { x, y } for a free end.",
  properties: {
    shapeId: { type: "string" },
    key: { type: "string" },
    side: { enum: SIDES },
    x: { type: "number" },
    y: { type: "number" },
  },
};

/** The connector fields of `create_shapes`. */
export const CONNECTOR_SPEC_PROPERTIES = {
  from: END_SCHEMA,
  to: END_SCHEMA,
  style: { enum: STYLES, description: "Connector route (default elbow)." },
  startHead: { enum: HEADS },
  endHead: { enum: HEADS },
};

/** One end of a connector from an agent's spec. */
export function connectorEndFrom(
  spec: ElementSpec,
  key: "from" | "to",
  context: ElementBuildContext,
): ConnectorEnd {
  const end = spec.args[key];
  if (typeof end !== "object" || end === null) {
    throw new Error(`A connector needs "${key}": { shapeId }, { key } or { x, y }.`);
  }
  const fields = end as Record<string, unknown>;
  const side = oneOf(fields.side, SIDES, `${key}.side`) ?? null;
  const ref = typeof fields.shapeId === "string" ? fields.shapeId : fields.key;
  if (typeof ref === "string") {
    const el = context.lookup(ref);
    if (!el) throw new Error(`"${key}" doesn't match a shape: ${ref}`);
    if (!context.kinds.kindOf(el).connectable)
      throw new Error(`Connectors can't attach to ${el.type} shapes.`);
    return { shapeId: el.id, side, x: el.x + el.w / 2, y: el.y + el.h / 2 };
  }
  const { x, y } = fields;
  if (typeof x !== "number" || typeof y !== "number") {
    throw new Error(`"${key}" needs a shapeId or key, or both x and y.`);
  }
  return { shapeId: null, side: null, x, y };
}

export function connectorStyleFrom(value: unknown): ConnectorStyle | undefined {
  return oneOf(value, STYLES, "style");
}

export function arrowHeadFrom(value: unknown, name: string): ArrowHead | undefined {
  return oneOf(value, HEADS, name);
}

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  name: string,
): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string" && (allowed as readonly string[]).includes(value))
    return value as T;
  throw new Error(`"${name}" must be one of: ${allowed.join(", ")}.`);
}
