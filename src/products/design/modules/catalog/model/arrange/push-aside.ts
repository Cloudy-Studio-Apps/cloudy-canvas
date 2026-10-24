import { rectsIntersect, type Point, type Rect } from "@canvas";

import type { ArrangeObstacle } from "./arrange.types";

/**
 * Moves the obstacles in `area` (grown by `gap`) out of it: those whose middle is above the
 * area's go up, the others down, each group by one offset so its layers keep their places
 * relative to each other, and layers a moved one would land on go along with it (repeated until
 * nothing moved overlaps anything that stayed). Returns each moved obstacle's offset (`x` is 0).
 */
export function pushAside(
  area: Rect,
  obstacles: readonly ArrangeObstacle[],
  gap: number,
): Map<string, Point> {
  const middle = area.y + area.h / 2;
  const hit = obstacles.filter((ob) => rectsIntersect(grow(area, gap), ob.rect));
  const up = hit.filter((ob) => ob.rect.y + ob.rect.h / 2 < middle);
  const down = hit.filter((ob) => !up.includes(ob));
  const offsets = new Map<string, Point>();
  if (down.length) {
    const dy = area.y + area.h + gap - Math.min(...down.map((ob) => ob.rect.y));
    cascade(down, dy, obstacles, gap, offsets, up);
  }
  if (up.length) {
    const dy = area.y - gap - Math.max(...up.map((ob) => ob.rect.y + ob.rect.h));
    cascade(up, dy, obstacles, gap, offsets, down);
  }
  return offsets;
}

/**
 * Moves `group` by `dy`, taking along whatever it would land on, into `offsets`; the layers of
 * the other group (`pushedOther`) go their own way and are never taken along.
 */
function cascade(
  group: ArrangeObstacle[],
  dy: number,
  obstacles: readonly ArrangeObstacle[],
  gap: number,
  offsets: Map<string, Point>,
  pushedOther: readonly ArrangeObstacle[],
): void {
  const moved = new Set(group);
  const queue = [...group];
  for (let ob = queue.pop(); ob; ob = queue.pop()) {
    const landed = grow({ ...ob.rect, y: ob.rect.y + dy }, gap);
    for (const other of obstacles) {
      if (moved.has(other) || offsets.has(other.id) || pushedOther.includes(other)) continue;
      if (!rectsIntersect(landed, other.rect)) continue;
      moved.add(other);
      queue.push(other);
    }
  }
  const step = Math.round(dy);
  if (step === 0) return;
  for (const ob of moved) offsets.set(ob.id, { x: 0, y: step });
}

function grow(rect: Rect, by: number): Rect {
  return { x: rect.x - by, y: rect.y - by, w: rect.w + by * 2, h: rect.h + by * 2 };
}
