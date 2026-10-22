import type { Graphics } from "pixi.js";

import type { RelationPath } from "./relation-path.types";

/** Adds the relation's curve to the graphics (the caller strokes it). */
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
