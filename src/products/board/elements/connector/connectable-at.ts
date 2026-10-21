import type { CanvasElement, Point, ToolContext } from "@canvas";

/** Hit tolerance, in screen px. */
const HIT_PX = 4;

/** Topmost element at a world point that a connector can attach to. */
export function connectableAt(
  ctx: ToolContext,
  world: Point,
  exclude?: ReadonlySet<string>,
): CanvasElement | undefined {
  const tolerance = HIT_PX / ctx.camera.zoom;
  const near = ctx.elementsInRect({
    x: world.x - tolerance,
    y: world.y - tolerance,
    w: tolerance * 2,
    h: tolerance * 2,
  });
  for (let i = near.length - 1; i >= 0; i--) {
    const el = near[i]!;
    const kind = ctx.kinds.kindOf(el);
    if (kind.connectable && !exclude?.has(el.id) && kind.hitTest(el, world, tolerance)) return el;
  }
  return undefined;
}
