import type { Graphics } from "pixi.js";

import type { RelationPath } from "../../db";

export function drawRelationPath(g: Graphics, path: RelationPath): void {
  g.moveTo(path.start.x, path.start.y).bezierCurveTo(
    path.c1.x,
    path.c1.y,
    path.c2.x,
    path.c2.y,
    path.end.x,
    path.end.y,
  );
}
