import { createId } from "@shared/core";

import { pairByName } from "../../db/schema/pair-by-name";
import { checkNames, ReconcileError } from "../../db/schema/reconcile-error";
import { NO_ER_DIAGRAM } from "../base/no-er-diagram";
import { ER_ENTITY_COLOR, ER_RELATION_COLOR } from "../../../palette";
import type { ErEntityElement } from "../entity/entity.types";
import type { ErRelationElement } from "../relation/relation.types";
import { entitySize, relationSize } from "../base/er-size";
import { keepCenter } from "../base/keep-center";
import { allErShapes } from "./er-shapes";
import type { ErShapes, ParsedEr, ParsedErAttribute, ParsedErRelation } from "./lang";
import { buildAttributes } from "./reconcile-attributes";
import type { ReconcileContext } from "./reconcile-context.types";
import type { ErReconcileResult } from "./reconcile-er.types";
import { buildAggregates, buildConstraints, buildIsas, buildUnions } from "./reconcile-extended";
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
    // An associative entity is named among the entities too.
    checkNames(
      model.relations.filter((r) => r.associative),
      new Set([...model.entities, ...model.aggregates].map((e) => e.name)),
      "Associative entity",
    );

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
    const entities = model.entities.map((parsed, i): ErEntityElement => {
      const match = entityPairs.get(i);
      const size = entitySize(parsed.name);
      const id = track(match?.id);
      ctx.entityIds.set(parsed.name, id);
      build(parsed.attributes, id, match?.id);
      return {
        id,
        type: "er-entity",
        ...NO_ER_DIAGRAM,
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
    // Every relation's id first: an associative entity takes part in relations defined before it.
    const relationIds = model.relations.map((parsed, i) => {
      const id = track(relationPairs.get(i)?.id);
      ctx.relationIds.set(parsed.name, id);
      if (parsed.associative) ctx.entityIds.set(parsed.name, id);
      return id;
    });
    const relations = model.relations.map((parsed, i): ErRelationElement => {
      const match = relationPairs.get(i);
      const size = relationSize(parsed.name);
      const id = relationIds[i] ?? track(match?.id);
      build(parsed.attributes, id, match?.id);
      return {
        id,
        type: "er-relation",
        ...NO_ER_DIAGRAM,
        index: match?.index ?? "",
        ...keepCenter(match, size),
        ...size,
        name: parsed.name,
        identifying: parsed.identifying,
        idMark: parsed.idMark,
        existenceMark: parsed.existenceMark,
        associative: parsed.associative,
        color: parsed.color ?? match?.color ?? ER_RELATION_COLOR,
        participants: parsed.participants.map((p, k) => ({
          id: match?.participants[k]?.id ?? createId(),
          entityId: entityId(ctx, p.entity, p.line),
          min: p.min,
          max: p.max,
          role: p.role,
          arrow: p.arrow,
          // The attribute is found once every owner's attributes are built (`joinVias`).
          via: "",
        })),
      };
    });

    const shapes: ErShapes = {
      entities,
      relations: joinVias(relations, model.relations, ctx),
      attributes: ctx.attributes,
      isas: buildIsas(model.isas, ctx),
      aggregates: buildAggregates(model.aggregates, aggregateIds, ctx),
      constraints: buildConstraints(model.constraints, ctx),
      unions: buildUnions(model.unions, ctx),
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

/** Points each participant written `Entity.attribute` at that attribute of its entity. */
function joinVias(
  relations: ErRelationElement[],
  parsed: readonly ParsedErRelation[],
  ctx: ReconcileContext,
): ErRelationElement[] {
  return relations.map((relation, i) => ({
    ...relation,
    participants: relation.participants.map((participant, k) => {
      const written = parsed[i]?.participants[k];
      if (!written?.via) return participant;
      const attribute = ctx.attributes.find(
        (a) => a.ownerId === participant.entityId && a.name === written.via,
      );
      if (!attribute) {
        throw new ReconcileError(
          `"${written.entity}" has no attribute "${written.via}" (it's created when you leave the editor)`,
          written.line,
        );
      }
      return { ...participant, via: attribute.id };
    }),
  }));
}
