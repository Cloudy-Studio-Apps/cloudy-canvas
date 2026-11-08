import type { Paint } from "../core";

/**
 * The paths of a paint stack's visible colors, under `prefix` (`fills`): solid paints' colors and
 * gradients' stops. Each is a `…color` path whose parent holds an `opacity`.
 */
export function paintColorPaths(prefix: string, paints: readonly Paint[]): string[] {
  const paths: string[] = [];
  paints.forEach((paint, i) => {
    if (!paint.visible) return;
    if (paint.type === "solid") paths.push(`${prefix}.${i}.color`);
    else if (paint.type !== "image") {
      paint.stops.forEach((_, k) => paths.push(`${prefix}.${i}.stops.${k}.color`));
    }
  });
  return paths;
}
