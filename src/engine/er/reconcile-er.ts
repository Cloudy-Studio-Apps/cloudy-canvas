import { createId } from "@core";

import { pairByName } from "../db/pair-by-name";
import { checkNames, ReconcileError } from "../db/reconcile-error";
import {
  ER_ENTITY_COLOR,
  ER_RELATION_COLOR,
  type ErAttributeShape,
  type ErEntityShape,
  type ErRelationShape,
} from "../document";
import { allErShapes } from "./er-shapes";
import { entitySize, relationSize } from "./er-size";
import { keepCenter } from "./keep-center";
import type { ErShapes, ParsedEr } from "./lang";
import { buildAttributes } from "./reconcile-attributes";
import type { ErReconcileResult } from "./reconcile-er.types";

/**
 * Works out the board's ER shapes for a parsed text. Entities, relations and attributes are
 * matched by name (then by position, for renames) so their ids, positions and lines survive.
 */
export function reconcileEr(model: ParsedEr, existing: ErShapes): ErReconcileResult {
  try {
    checkNames(model.entities, new Set(), "Entity");
    checkNames(model.relations, new Set(), "Relation");

    const added = new Set<string>();
    const attributes: ErAttributeShape[] = [];

    const entityPairs = pairByName(model.entities, existing.entities);
    const entities = model.entities.map((parsed, i): ErEntityShape => {
      const match = entityPairs.get(i);
      const size = entitySize(parsed.name);
      const id = match?.id ?? createId();
      if (!match) added.add(id);
      buildAttributes(parsed.attributes, id, match?.id, existing.attributes, attributes, added);
      return {
        id,
        type: "er-entity",
        index: match?.index ?? "",
        ...keepCenter(match, size),
        ...size,
        name: parsed.name,
        weak: parsed.weak,
        color: match?.color ?? ER_ENTITY_COLOR,
      };
    });
    const entityIds = new Map(entities.map((e) => [e.name, e.id]));

    const relationPairs = pairByName(model.relations, existing.relations);
    const relations = model.relations.map((parsed, i): ErRelationShape => {
      const match = relationPairs.get(i);
      const size = relationSize(parsed.name);
      const id = match?.id ?? createId();
      if (!match) added.add(id);
      buildAttributes(parsed.attributes, id, match?.id, existing.attributes, attributes, added);
      return {
        id,
        type: "er-relation",
        index: match?.index ?? "",
        ...keepCenter(match, size),
        ...size,
        name: parsed.name,
        identifying: parsed.identifying,
        color: match?.color ?? ER_RELATION_COLOR,
        participants: parsed.participants.map((p, k) => {
          const entityId = entityIds.get(p.entity);
          if (!entityId) throw new ReconcileError(`Unknown entity "${p.entity}"`, p.line);
          return {
            id: match?.participants[k]?.id ?? createId(),
            entityId,
            min: p.min,
            max: p.max,
            role: p.role,
          };
        }),
      };
    });

    const shapes: ErShapes = { entities, relations, attributes };
    const kept = new Set(allErShapes(shapes).map((s) => s.id));
    const removed = allErShapes(existing)
      .map((s) => s.id)
      .filter((id) => !kept.has(id));
    return { ok: true, plan: { shapes, added, removed } };
  } catch (error) {
    if (error instanceof ReconcileError) return { ok: false, error: error.toDbmlError() };
    throw error;
  }
}
