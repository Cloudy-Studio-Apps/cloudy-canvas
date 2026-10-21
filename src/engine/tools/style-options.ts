import type { Shape, ShapePatch } from "../document";
import type { ToolOptions } from "./tool.types";

/**
 * How picking an option in the tool options panel restyles the selected shapes, like FigJam:
 * a sticky color recolors stickies, shape options restyle shapes, connector options restyle connectors.
 */
export function stylePatches(
  shapes: readonly Shape[],
  options: Partial<ToolOptions>,
): Map<string, ShapePatch> {
  const patches = new Map<string, ShapePatch>();
  for (const shape of shapes) {
    const patch = stylePatch(shape, options);
    if (Object.keys(patch).length > 0) patches.set(shape.id, patch);
  }
  return patches;
}

function stylePatch(shape: Shape, o: Partial<ToolOptions>): ShapePatch {
  switch (shape.type) {
    case "sticky":
      return o.stickyColor ? { color: o.stickyColor } : {};
    case "geo":
      return defined({ kind: o.shapeKind, fill: o.shapeFill, stroke: o.shapeStroke });
    case "connector":
      return defined({
        style: o.connectorStyle,
        color: o.connectorColor,
        startHead: o.connectorStartHead,
        endHead: o.connectorEndHead,
      });
    default:
      return {};
  }
}

/** The options a shape was styled with, so the panel shows the selected shape's look. */
export function optionsFromShape(shape: Shape): Partial<ToolOptions> {
  switch (shape.type) {
    case "sticky":
      return { stickyColor: shape.color };
    case "geo":
      return { shapeKind: shape.kind, shapeFill: shape.fill, shapeStroke: shape.stroke };
    case "connector":
      return {
        connectorStyle: shape.style,
        connectorColor: shape.color,
        connectorStartHead: shape.startHead,
        connectorEndHead: shape.endHead,
      };
    default:
      return {};
  }
}

function defined(patch: ShapePatch): ShapePatch {
  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
}
