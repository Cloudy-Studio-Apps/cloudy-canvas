import {
  createConnectorShape,
  createGeoShape,
  createSectionShape,
  createStickyShape,
  createTextDraft,
  GEO_DEFAULT_SIZES,
  GEO_KINDS,
  INK_COLOR,
  isConnectable,
  SECTION_COLORS,
  SECTION_DEFAULT_H,
  SECTION_DEFAULT_W,
  SHAPE_FILLS,
  SHAPE_STROKES,
  STICKY_COLORS,
  STICKY_SIZE,
  TEXT_FONT_SIZE,
  type ArrowHead,
  type ConnectorEnd,
  type ConnectorSide,
  type ConnectorStyle,
  type GeoKind,
  type Shape,
} from "../document";
import { measureText } from "../text";
import type { ToolArgs } from "./agent-tool.types";
import type { ShapeLookup } from "./build-shape.types";
import { optionalNumber, optionalRecord, optionalString, stringArg } from "./tool-args";

export const CREATABLE_TYPES = ["sticky", "text", "geo", "section", "connector"] as const;

const SIDES: readonly ConnectorSide[] = ["top", "right", "bottom", "left"];
const STYLES: readonly ConnectorStyle[] = ["straight", "elbow"];
const HEADS: readonly ArrowHead[] = ["none", "arrow"];

/** A new shape from an agent's spec. `x`/`y` are the top-left corner in world units. */
export function buildShape(spec: ToolArgs, index: string, lookup: ShapeLookup): Shape {
  const type = stringArg(spec, "type");
  const text = optionalString(spec, "text") ?? "";
  const x = optionalNumber(spec, "x") ?? 0;
  const y = optionalNumber(spec, "y") ?? 0;
  const w = optionalNumber(spec, "w");
  const h = optionalNumber(spec, "h");
  const color = optionalString(spec, "color");

  switch (type) {
    case "sticky": {
      const shape = createStickyShape({ x: 0, y: 0 }, color ?? STICKY_COLORS[0].value, index);
      return { ...shape, x, y, w: w ?? STICKY_SIZE, h: h ?? STICKY_SIZE, text };
    }
    case "text": {
      const fontSize = optionalNumber(spec, "fontSize") ?? TEXT_FONT_SIZE;
      const size = measureText(text, fontSize);
      if (!text.trim()) throw new Error("A text shape needs some text.");
      return {
        ...createTextDraft({ x, y }, fontSize),
        index,
        x,
        y,
        ...size,
        text,
        color: color ?? INK_COLOR,
      };
    }
    case "geo": {
      const kind = oneOf(spec, "kind", GEO_KINDS, "rectangle") as GeoKind;
      const size = GEO_DEFAULT_SIZES[kind];
      const rect = { x, y, w: w ?? size.w, h: h ?? size.h };
      const fill = optionalString(spec, "fill") ?? SHAPE_FILLS[0].value;
      const stroke = optionalString(spec, "stroke") ?? SHAPE_STROKES[0].value;
      return { ...createGeoShape(rect, kind, fill, stroke, index), text };
    }
    case "section": {
      const rect = { x, y, w: w ?? SECTION_DEFAULT_W, h: h ?? SECTION_DEFAULT_H };
      return createSectionShape(rect, text || "Section", color ?? SECTION_COLORS[0].value, index);
    }
    case "connector": {
      const start = connectorEnd(spec, "from", lookup);
      const end = connectorEnd(spec, "to", lookup);
      const style = oneOf(spec, "style", STYLES, "elbow") as ConnectorStyle;
      const startHead = oneOf(spec, "startHead", HEADS, "none") as ArrowHead;
      const endHead = oneOf(spec, "endHead", HEADS, "arrow") as ArrowHead;
      return createConnectorShape(
        start,
        end,
        { style, color: color ?? INK_COLOR, startHead, endHead },
        index,
      );
    }
    default:
      throw new Error(
        `Can't create "${type}" shapes. Use one of: ${CREATABLE_TYPES.join(", ")}. ` +
          "Tables and enums come from apply_schema_dbml, ER shapes from apply_er_text.",
      );
  }
}

function connectorEnd(spec: ToolArgs, key: string, lookup: ShapeLookup): ConnectorEnd {
  const end = optionalRecord(spec, key);
  if (!end) throw new Error(`A connector needs "${key}": { shapeId } or { x, y }.`);
  const ref = optionalString(end, "shapeId");
  const side = (oneOf(end, "side", SIDES, null) as ConnectorSide | null) ?? null;
  if (ref) {
    const shape = lookup(ref);
    if (!shape) throw new Error(`"${key}.shapeId" doesn't match a shape: ${ref}`);
    if (!isConnectable(shape)) throw new Error(`Connectors can't attach to ${shape.type} shapes.`);
    return { shapeId: shape.id, side, x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 };
  }
  const x = optionalNumber(end, "x");
  const y = optionalNumber(end, "y");
  if (x === undefined || y === undefined) {
    throw new Error(`"${key}" needs a shapeId, or both x and y.`);
  }
  return { shapeId: null, side: null, x, y };
}

function oneOf<T extends string, D extends T | null>(
  args: ToolArgs,
  key: string,
  allowed: readonly T[],
  fallback: D,
): T | D {
  const value = optionalString(args, key);
  if (value === undefined) return fallback;
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(`"${key}" must be one of: ${allowed.join(", ")}.`);
  }
  return value as T;
}
