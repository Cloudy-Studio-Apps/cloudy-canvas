import type { Shape } from "../document";
import type { ShapeSummary } from "./shape-summary.types";

export function summarizeShape(shape: Shape): ShapeSummary {
  const summary: ShapeSummary = {
    id: shape.id,
    type: shape.type,
    x: Math.round(shape.x),
    y: Math.round(shape.y),
    w: Math.round(shape.w),
    h: Math.round(shape.h),
  };
  const label = shapeLabel(shape);
  if (label) summary.label = label;
  if (shape.type === "geo") summary.kind = shape.kind;
  if (shape.type === "connector") {
    summary.from = shape.start.shapeId;
    summary.to = shape.end.shapeId;
  }
  return summary;
}

function shapeLabel(shape: Shape): string {
  switch (shape.type) {
    case "sticky":
    case "text":
    case "geo":
    case "section":
      return shape.text;
    case "db-table":
    case "db-enum":
    case "er-entity":
    case "er-relation":
    case "er-attribute":
      return shape.name;
    default:
      return "";
  }
}
