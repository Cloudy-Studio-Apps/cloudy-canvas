import type { Graphics } from "pixi.js";
import type { CanvasElement, CanvasLinks, LinkView, Point } from "@canvas";

import { drawRelationPath, enumLinkPath, relationPath, type DbRefKind } from "../table";
import { resolveEnumLinks, resolveRelations } from "./relations";
import type { EnumLink, Relation } from "./relations.types";

/** Crow's foot length and half-spread, and the "one" bar offset, in world units. */
const FOOT_LENGTH = 12;
const FOOT_SPREAD = 6;
const BAR_OFFSET = 8;
const LINE_WIDTH_PX = 1.5;

/**
 * Lines of the board's database schema: relations between table columns (crow's feet for the
 * "many" ends) and quieter links from columns to the enums they're typed with.
 */
export class DbLinks implements CanvasLinks {
  private relations: Relation[] = [];
  private enumLinks: EnumLink[] = [];

  update(elements: readonly CanvasElement[]): void {
    this.relations = resolveRelations(elements);
    this.enumLinks = resolveEnumLinks(elements);
  }

  draw(g: Graphics, { zoom, theme, highlighted }: LinkView): void {
    const width = LINE_WIDTH_PX / zoom;
    for (const relation of this.relations) {
      const path = relationPath(relation.from, relation.fromRow, relation.to, relation.toRow);
      const active = highlighted.has(relation.from.id) || highlighted.has(relation.to.id);
      drawRelationPath(g, path);
      drawEnd(g, path.start, path.startDir, isMany(relation.kind, "from"));
      drawEnd(g, path.end, path.endDir, isMany(relation.kind, "to"));
      g.stroke({ color: active ? theme.selection : theme.relation, width });
    }
    // Enum links are quieter: a thin line ending in a small dot on the enum's header.
    for (const link of this.enumLinks) {
      const path = enumLinkPath(link.table, link.row, link.target);
      const active = highlighted.has(link.table.id) || highlighted.has(link.target.id);
      const color = active ? theme.selection : theme.relation;
      drawRelationPath(g, path);
      g.stroke({ color, width: width * 0.75, alpha: active ? 1 : 0.45 });
      g.circle(path.end.x, path.end.y, 2.5 / zoom).fill({ color });
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
