import { createId } from "@core";

import { pairByName } from "../db/pair-by-name";
import { checkNames, ReconcileError } from "../db/reconcile-error";
import {
  ER_ENTITY_COLOR,
  ER_RELATION_COLOR,
  type ErEntityShape,
  type ErRelationShape,
} from "../document";
import { allErShapes } from "./er-shapes";
import { entitySize, relationSize } from "./er-size";
import { keepCenter } from "./keep-center";
import type { ErShapes, ParsedEr, ParsedErAttribute } from "./lang";
import { buildAttributes } from "./reconcile-attributes";
import type { ReconcileContext } from "./reconcile-context.types";
import type { ErReconcileResult } from "./reconcile-er.types";
import { buildAggregates, buildConstraints, buildIsas } from "./reconcile-extended";
import { entityId } from "./reconcile-names";

/**
 * Works out the board's ER shapes for a parsed text. Everything is matched by name (then by
 * position, for renames) so ids, positions and lines survive.
 */
export function reconcileEr(model: ParsedEr, existing: ErShapes): ErReconcileResult {
  try {
    checkNames(model.entities, new Set(), "Entity");
    checkNames(model.aggregates, new Set(model.entities.map((e) => e.name)), "Aggregation");
    checkNames(model.relations, new Set(), "Relation");

    const ctx: ReconcileContext = {
      existing,
      added: new Set(),
      attributes: [],
      // The text says lollipop with a `Diagram` line; without one the look is Chen.
      look: model.style ?? "ellipse",
      entityIds: new Map(),
      relationIds: new Map(),
    };
    const build = (parsed: ParsedErAttribute[], id: string, oldId?: string) =>
      buildAttributes(parsed, id, oldId, existing.attributes, ctx.attributes, ctx.added, ctx.look);
    const track = (id: string | undefined): string => {
      if (id) return id;
      const fresh = createId();
      ctx.added.add(fresh);
      return fresh;
    };

    const entityPairs = pairByName(model.entities, existing.entities);
    const entities = model.entities.map((parsed, i): ErEntityShape => {
      const match = entityPairs.get(i);
      const size = entitySize(parsed.name);
      const id = track(match?.id);
      ctx.entityIds.set(parsed.name, id);
      build(parsed.attributes, id, match?.id);
      return {
        id,
        type: "er-entity",
        index: match?.index ?? "",
        ...keepCenter(match, size),
        ...size,
        name: parsed.name,
        weak: parsed.weak,
        color: parsed.color ?? match?.color ?? ER_ENTITY_COLOR,
      };
    });
    // Aggregations take part in relations like entities, so their ids are needed first.
    const aggregatePairs = pairByName(model.aggregates, existing.aggregates);
    const aggregateIds = model.aggregates.map((parsed, i) => {
      const id = track(aggregatePairs.get(i)?.id);
      ctx.entityIds.set(parsed.name, id);
      return id;
    });

    const relationPairs = pairByName(model.relations, existing.relations);
    const relations = model.relations.map((parsed, i): ErRelationShape => {
      const match = relationPairs.get(i);
      const size = relationSize(parsed.name);
      const id = track(match?.id);
      ctx.relationIds.set(parsed.name, id);
      build(parsed.attributes, id, match?.id);
      return {
        id,
        type: "er-relation",
        index: match?.index ?? "",
        ...keepCenter(match, size),
        ...size,
        name: parsed.name,
        identifying: parsed.identifying,
        idMark: parsed.idMark,
        color: parsed.color ?? match?.color ?? ER_RELATION_COLOR,
        participants: parsed.participants.map((p, k) => ({
          id: match?.participants[k]?.id ?? createId(),
          entityId: entityId(ctx, p.entity, p.line),
          min: p.min,
          max: p.max,
          role: p.role,
          arrow: p.arrow,
        })),
      };
    });

    const shapes: ErShapes = {
      entities,
      relations,
      attributes: ctx.attributes,
      isas: buildIsas(model.isas, ctx),
      aggregates: buildAggregates(model.aggregates, aggregateIds, ctx),
      constraints: buildConstraints(model.constraints, ctx),
    };
    const kept = new Set(allErShapes(shapes).map((s) => s.id));
    const removed = allErShapes(existing)
      .map((s) => s.id)
      .filter((id) => !kept.has(id));
    return { ok: true, plan: { shapes, added: ctx.added, removed } };
  } catch (error) {
    if (error instanceof ReconcileError) return { ok: false, error: error.toDbmlError() };
    throw error;
  }
}
