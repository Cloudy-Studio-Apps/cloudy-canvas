import type { CanvasElement, Point } from "@canvas";

import { isErElement } from "../base/is-er-element";
import type { ErIsaElement } from "../isa/isa.types";
import type { ErRelationElement } from "../relation/relation.types";
import type { ErElement } from "../base/er.types";
import { outlinePoint, shapeCenter } from "../base/er-outline";
import { erNotation } from "../base/er-notation";
import type { ErUnionElement } from "../union/union.types";
import type { CrowFoot, ErLink } from "./er-links.types";
import { LINK_LABEL_FONT_SIZE } from "./link-label";
import { loopPoints } from "./loop-route";

/** How far from the entity a label starts: past the crow's-foot marks (they reach 22). */
const LABEL_CLEAR = 26;
/** The gap between a label and its line. */
const LABEL_GAP = 4;

/**
 * Every line of the ER diagram: relation ↔ entity (with cardinality), attribute ↔ owner,
 * hierarchy ↔ parent / children and union type ↔ superclasses / category. Expects aggregations already resolved (their bounds current).
 */
export function resolveErLinks(shapes: readonly CanvasElement[]): ErLink[] {
  const byId = new Map<string, ErElement>();
  for (const shape of shapes) if (isErElement(shape)) byId.set(shape.id, shape);
  const links: ErLink[] = [];
  for (const shape of byId.values()) {
    if (shape.type === "er-relation") links.push(...participantLinks(shape, byId));
    else if (shape.type === "er-isa") links.push(...isaLinks(shape, byId));
    else if (shape.type === "er-union") links.push(...unionLinks(shape, byId));
    else if (shape.type === "er-attribute") {
      const owner = byId.get(shape.ownerId);
      if (owner) links.push(straightLink(shape, owner, "", false));
    }
  }
  return links;
}

function participantLinks(
  relation: ErRelationElement,
  byId: ReadonlyMap<string, ErElement>,
): ErLink[] {
  const notation = erNotation(relation.notation);
  const counts = new Map<string, number>();
  for (const p of relation.participants) counts.set(p.entityId, (counts.get(p.entityId) ?? 0) + 1);
  const seen = new Map<string, number>();
  const binary = relation.participants.length === 2;
  return relation.participants.flatMap((participant, i) => {
    const entity = byId.get(participant.entityId);
    if (!entity) return [];
    const via = participant.via ? byId.get(participant.via) : undefined;
    const viaName = notation.joins === "shown" && via && "name" in via ? via.name : "";
    const card =
      notation.cardinality === "ratio"
        ? chenLetter(relation, i)
        : notation.participation === "lines"
          ? ""
          : cardinalityLabel(participant.min, participant.max);
    const label = viaName ? (card ? `${card} · ${viaName}` : viaName) : card;
    const n = seen.get(entity.id) ?? 0;
    seen.set(entity.id, n + 1);
    const opposite = binary ? relation.participants[1 - i] : undefined;
    const other = notation.crowFeet ? opposite : undefined;
    // Silberschatz's arrows: at an entity the other side takes part with at most once.
    const arrow = participant.arrow || (notation.arrows === "cardinality" && opposite?.max === "1");
    const marks = {
      crowFoot: other ? crowFootOf(other.min, other.max) : null,
      double: notation.participation !== "numbers" && isMandatory(participant.min),
    };
    // An entity related to itself gets loops that leave from different sides.
    if ((counts.get(entity.id) ?? 1) > 1) {
      const points = loopPoints(relation, entity, n);
      return [{ ...polyLink(relation.id, entity.id, points, label, arrow), ...marks }];
    }
    return [{ ...straightLink(relation, entity, label, arrow), ...marks }];
  });
}

/**
 * Chen's 1 / N / M beside a participant: in a two-way relation, how many of it one of the other
 * has (the other side's maximum; M and N when both are many); in a larger one, its own maximum.
 */
function chenLetter(relation: ErRelationElement, i: number): string {
  const { participants } = relation;
  const many = (max: string) => max !== "1";
  if (participants.length === 2) {
    const other = participants[1 - i];
    if (!other?.max || !participants[i]?.max) return "";
    if (many(other.max) && many(participants[i].max)) return i === 0 ? "M" : "N";
    return many(other.max) ? "N" : "1";
  }
  const max = participants[i]?.max;
  return max ? (many(max) ? "N" : "1") : "";
}

/** A minimum of at least one: total participation. */
function isMandatory(min: string): boolean {
  return min !== "" && min !== "0";
}

/** The marks for the other participant's `(min,max)`; `null` when it has no maximum. */
function crowFootOf(min: string, max: string): CrowFoot | null {
  if (!max) return null;
  return {
    max: max === "1" ? "one" : "many",
    min: min === "" ? null : min === "0" ? "zero" : "one",
  };
}

/** A union type: a line from each superclass to the circle, and one to the category marked ⊂. */
function unionLinks(union: ErUnionElement, byId: ReadonlyMap<string, ErElement>): ErLink[] {
  const links: ErLink[] = [];
  for (const id of union.superclassIds) {
    const superclass = byId.get(id);
    if (superclass) links.push(straightLink(union, superclass, "", false));
  }
  const category = byId.get(union.categoryId);
  if (category) links.push(straightLink(union, category, "\u2282", false));
  return links;
}

function isaLinks(isa: ErIsaElement, byId: ReadonlyMap<string, ErElement>): ErLink[] {
  const links: ErLink[] = [];
  const parent = byId.get(isa.parentId);
  if (parent) {
    const top = { x: isa.x + isa.w / 2, y: isa.y };
    const end = outlinePoint(parent, top);
    links.push({
      ...polyLink(
        isa.id,
        parent.id,
        [top, end],
        cardinalityLabel(isa.parentMin, isa.parentMax),
        false,
      ),
      // With the d/o circle a total hierarchy's parent line is doubled instead of marked.
      totalMark: isa.total && erNotation(isa.notation).isa !== "circle",
      double: isa.total && erNotation(isa.notation).isa === "circle",
    });
  }
  for (const child of isa.children) {
    const entity = byId.get(child.entityId);
    if (entity)
      links.push(straightLink(isa, entity, cardinalityLabel(child.min, child.max), false));
  }
  return links;
}

function straightLink(from: ErElement, to: ErElement, label: string, arrow: boolean): ErLink {
  const start = outlinePoint(from, shapeCenter(to));
  const end = outlinePoint(to, shapeCenter(from));
  return polyLink(from.id, to.id, [start, end], label, arrow);
}

function polyLink(
  fromId: string,
  toId: string,
  points: Point[],
  label: string,
  arrow: boolean,
): ErLink {
  const end = points[points.length - 1]!;
  const before = points[points.length - 2] ?? end;
  return {
    fromId,
    toId,
    points,
    label,
    labelAt: label ? labelPoint(before, end, label) : null,
    arrow,
    totalMark: false,
    double: false,
    crowFoot: null,
  };
}

function cardinalityLabel(min: string, max: string): string {
  return min || max ? `(${min || "0"},${max || "n"})` : "";
}

/**
 * Where a label is centered: beside the last segment, on the side above (or left of) the line, its
 * whole box past the marks at the entity and clear of the line, however long it is. The size is
 * estimated from the text (`LINK_LABEL_FONT_SIZE`, about 0.58 em per character).
 */
function labelPoint(before: Point, end: Point, text: string): Point {
  const len = Math.hypot(end.x - before.x, end.y - before.y) || 1;
  const ux = (end.x - before.x) / len;
  const uy = (end.y - before.y) / len;
  let nx = -uy;
  let ny = ux;
  if (ny > 0 || (ny === 0 && nx > 0)) {
    nx = -nx;
    ny = -ny;
  }
  const halfW = (text.length * LINK_LABEL_FONT_SIZE * 0.58) / 2;
  const halfH = (LINK_LABEL_FONT_SIZE * 1.25) / 2;
  // How far the box reaches along the line, and across it.
  const alongReach = Math.abs(ux) * halfW + Math.abs(uy) * halfH;
  const acrossReach = Math.abs(nx) * halfW + Math.abs(ny) * halfH;
  const along = Math.min(LABEL_CLEAR + alongReach, len / 2);
  const across = LABEL_GAP + acrossReach;
  return {
    x: end.x - ux * along + nx * across,
    y: end.y - uy * along + ny * across,
  };
}
