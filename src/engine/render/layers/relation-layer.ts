import { Graphics } from "pixi.js";

import { enumLinkPath, relationPath } from "../../db";
import type { DbRefKind } from "../../document";
import type { Point } from "../../geometry.types";
import type { RelationState } from "../relation-state.types";
import { drawRelationPath } from "./draw-relation-path";

/** Crow's foot length and half-spread, and the "one" bar offset, in world units. */
const FOOT_LENGTH = 12;
const FOOT_SPREAD = 6;
const BAR_OFFSET = 8;
export const LINE_WIDTH_PX = 1.5;

/** Lines between database tables, in world space under the shapes so tables cover their ends. */
export class RelationLayer extends Graphics {
  draw(state: RelationState, zoom: number, color: number, highlight: number): void {
    this.clear();
    const width = LINE_WIDTH_PX / zoom;
    for (const relation of state.relations) {
      const path = relationPath(relation.from, relation.fromRow, relation.to, relation.toRow);
      const active =
        state.highlighted.has(relation.from.id) || state.highlighted.has(relation.to.id);
      drawRelationPath(this, path);
      drawEnd(this, path.start, path.startDir, isMany(relation.kind, "from"));
      drawEnd(this, path.end, path.endDir, isMany(relation.kind, "to"));
      this.stroke({ color: active ? highlight : color, width });
    }
    // Enum links are quieter: a thin line ending in a small dot on the enum's header.
    for (const link of state.enumLinks) {
      const path = enumLinkPath(link.table, link.row, link.target);
      const active = state.highlighted.has(link.table.id) || state.highlighted.has(link.target.id);
      drawRelationPath(this, path);
      this.stroke({
        color: active ? highlight : color,
        width: width * 0.75,
        alpha: active ? 1 : 0.45,
      });
      this.circle(path.end.x, path.end.y, 2.5 / zoom).fill({ color: active ? highlight : color });
    }
  }
}

/** Which ends of a relation are on the "many" side. */
function isMany(kind: DbRefKind, end: "from" | "to"): boolean {
  if (kind === "<>") return true;
  return end === "from" ? kind === ">" : kind === "<";
}

/** A crow's foot for "many", a bar for "one". `dir` points away from the table. */
function drawEnd(g: Graphics, p: Point, dir: number, many: boolean): void {
  if (many) {
    const tip = p.x + dir * FOOT_LENGTH;
    g.moveTo(tip, p.y).lineTo(p.x, p.y - FOOT_SPREAD);
    g.moveTo(tip, p.y).lineTo(p.x, p.y + FOOT_SPREAD);
  } else {
    const x = p.x + dir * BAR_OFFSET;
    g.moveTo(x, p.y - FOOT_SPREAD).lineTo(x, p.y + FOOT_SPREAD);
  }
}
