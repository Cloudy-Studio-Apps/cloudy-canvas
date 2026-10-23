import type { Point, Rect } from "@canvas";

import { ER_DEFAULTS } from "../../base/er.defaults";
import type { ErShapes } from "../lang";
import { boxAt, overlaps } from "./box";
import { erShapeMap } from "./er-graph";
import type { Centers } from "./layout.types";

/** Matches the padding the scene gives aggregation boxes, plus some air. */
const PADDING = 18 + 12;
const PUSH_STEP = 12;
const MAX_PUSHES = 80;

/**
 * Once everything is placed: diamonds that take part with an aggregation but sit inside (or on)
 * its real box move out, away from the box, taking their attributes with them. Their other
 * participants move by as much, so the lines keep their length.
 */
export function clearAggregateBoxes(shapes: ErShapes, centers: Centers): void {
  const byId = erShapeMap(shapes);
  const owned = attributeTrees(shapes);
  for (const relation of shapes.relations) {
    for (const p of relation.participants) {
      const box = exactBox(p.entityId, shapes, centers, owned);
      const center = centers.get(relation.id);
      if (!box || !center) continue;
      const boxCenter = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
      const len = Math.hypot(center.x - boxCenter.x, center.y - boxCenter.y) || 1;
      const step = {
        x: ((center.x - boxCenter.x) / len) * PUSH_STEP,
        y: ((center.y - boxCenter.y) / len) * PUSH_STEP,
      };
      const group = [relation.id, ...(owned.get(relation.id) ?? [])];
      const hits = () =>
        group.some((id) => {
          const shape = byId.get(id);
          const at = centers.get(id);
          return shape && at && overlaps(box, boxAt(at, shape));
        });
      let pushes = 0;
      while (pushes < MAX_PUSHES && hits()) {
        move(centers, group, step, 1);
        pushes++;
      }
      if (pushes === 0) continue;
      const inside = new Set(boxMembers(p.entityId, shapes));
      const others = relation.participants
        .map((q) => q.entityId)
        .filter((id) => id !== p.entityId && !inside.has(id) && byId.get(id)?.type === "er-entity");
      move(
        centers,
        others.flatMap((id) => [id, ...(owned.get(id) ?? [])]),
        step,
        pushes,
      );
    }
  }
}

/**
 * Diamonds that have nothing to do with an aggregation but landed on its real box move out of it,
 * away from its middle, with their attributes (their lines stretch).
 */
export function clearForeignDiamonds(shapes: ErShapes, centers: Centers): void {
  const byId = erShapeMap(shapes);
  const owned = attributeTrees(shapes);
  for (const aggregate of shapes.aggregates) {
    const box = exactBox(aggregate.id, shapes, centers, owned);
    if (!box) continue;
    const inside = new Set([aggregate.relationId, ...boxMembers(aggregate.id, shapes)]);
    const boxCenter = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
    for (const relation of shapes.relations) {
      const center = centers.get(relation.id);
      if (!center || inside.has(relation.id)) continue;
      if (relation.participants.some((p) => p.entityId === aggregate.id)) continue;
      // Out through the nearer side: across the box's shorter half-extent.
      const horizontal =
        Math.abs(center.x - boxCenter.x) / box.w >= Math.abs(center.y - boxCenter.y) / box.h;
      const step = horizontal
        ? { x: Math.sign(center.x - boxCenter.x || 1) * PUSH_STEP, y: 0 }
        : { x: 0, y: Math.sign(center.y - boxCenter.y || 1) * PUSH_STEP };
      const group = [relation.id, ...(owned.get(relation.id) ?? [])];
      const hits = () => overlaps(box, boxAt(centers.get(relation.id)!, byId.get(relation.id)!));
      for (let pushes = 0; pushes < MAX_PUSHES && hits(); pushes++) move(centers, group, step, 1);
    }
  }
}

/**
 * Hierarchy triangles under an entity inside an aggregation move out of the real box, away from
 * the parent, taking the discriminator and the children (with their attributes) along.
 */
export function clearAggregateBoxesForIsas(shapes: ErShapes, centers: Centers): void {
  const byId = erShapeMap(shapes);
  const owned = attributeTrees(shapes);
  for (const aggregate of shapes.aggregates) {
    const box = exactBox(aggregate.id, shapes, centers, owned);
    if (!box) continue;
    for (const isa of shapes.isas) {
      const center = centers.get(isa.id);
      const parent = centers.get(isa.parentId);
      if (!center || !parent) continue;
      const len = Math.hypot(center.x - parent.x, center.y - parent.y) || 1;
      const step = {
        x: ((center.x - parent.x) / len) * PUSH_STEP,
        y: ((center.y - parent.y) / len) * PUSH_STEP,
      };
      let pushes = 0;
      const hits = () => overlaps(box, boxAt(centers.get(isa.id)!, byId.get(isa.id)!));
      while (pushes < MAX_PUSHES && hits()) {
        move(centers, [isa.id, ...(owned.get(isa.id) ?? [])], step, 1);
        pushes++;
      }
      const children = isa.children.map((c) => c.entityId);
      if (pushes)
        move(
          centers,
          children.flatMap((id) => [id, ...(owned.get(id) ?? [])]),
          step,
          pushes,
        );
    }
  }
}

function move(centers: Centers, ids: readonly string[], step: Point, times: number): void {
  for (const id of new Set(ids)) {
    const at = centers.get(id);
    if (at) centers.set(id, { x: at.x + step.x * times, y: at.y + step.y * times });
  }
}

/** The entities an aggregation holds. */
function boxMembers(id: string, shapes: ErShapes): string[] {
  const aggregate = shapes.aggregates.find((a) => a.id === id);
  const relation = shapes.relations.find((r) => r.id === aggregate?.relationId);
  return relation ? relation.participants.map((p) => p.entityId) : [];
}

/** The box an aggregation will get: its relation, participants and their attributes. */
export function exactBox(
  id: string,
  shapes: ErShapes,
  centers: Centers,
  owned: ReadonlyMap<string, string[]>,
): Rect | null {
  const aggregate = shapes.aggregates.find((a) => a.id === id);
  const relation = shapes.relations.find((r) => r.id === aggregate?.relationId);
  if (!relation) return null;
  const byId = erShapeMap(shapes);
  const roots = [relation.id, ...relation.participants.map((p) => p.entityId)];
  const ids = roots.flatMap((root) => [root, ...(owned.get(root) ?? [])]);
  const rects = ids.flatMap((member) => {
    const shape = byId.get(member);
    const at: Point | undefined = centers.get(member);
    return shape && at && shape.type !== "er-aggregate" ? [boxAt(at, shape)] : [];
  });
  if (rects.length === 0) return null;
  const x = Math.min(...rects.map((r) => r.x)) - PADDING;
  const y = Math.min(...rects.map((r) => r.y)) - PADDING - ER_DEFAULTS.aggregateTitleHeight;
  const right = Math.max(...rects.map((r) => r.x + r.w)) + PADDING;
  const bottom = Math.max(...rects.map((r) => r.y + r.h)) + PADDING;
  return { x, y, w: right - x, h: bottom - y };
}

/** Owner id → every attribute under it (composite parts included). */
export function attributeTrees({ attributes }: ErShapes): Map<string, string[]> {
  const direct = new Map<string, string[]>();
  for (const a of attributes) direct.set(a.ownerId, [...(direct.get(a.ownerId) ?? []), a.id]);
  const all = new Map<string, string[]>();
  const collect = (id: string): string[] =>
    (direct.get(id) ?? []).flatMap((child) => [child, ...collect(child)]);
  for (const owner of direct.keys()) all.set(owner, collect(owner));
  return all;
}
