import type { CanvasDocument, ElementPatch } from "@canvas";

import { freeName } from "../../db";
import { entitySize, relationSize } from "../base/er-size";
import { keepCenter } from "../base/keep-center";
import type { ErElement, ErNamedElement } from "../base/er.types";
import { allErShapes, diagramScope, erShapes } from "./er-shapes";

/**
 * Moves every shape of diagram `from` into diagram `into` (linking shapes of two diagrams joins
 * them). Names only have to be unique within a diagram, so moved entities, aggregations and
 * relations whose name `into` already uses get a free one (`name_2`), resized round their center.
 * Writes in the current undo step.
 */
export function mergeErDiagrams(doc: CanvasDocument, into: string, from: string): void {
  if (into === from) return;
  const target = erShapes(doc, into);
  const moving = erShapes(doc, from);
  const scope = diagramScope(target, into);
  // Entities and aggregations share one namespace; relations have their own.
  const entityNames: { name: string }[] = [...target.entities, ...target.aggregates];
  const relationNames: { name: string }[] = [...target.relations];
  const patches = new Map<string, ElementPatch<ErNamedElement>>();
  for (const shape of allErShapes(moving)) {
    patches.set(shape.id, { ...scope, ...renamed(shape, entityNames, relationNames) });
  }
  if (patches.size) doc.updateMany(patches);
}

function renamed(
  shape: ErElement,
  entityNames: { name: string }[],
  relationNames: { name: string }[],
): ElementPatch<ErNamedElement> {
  if (shape.type === "er-entity" || shape.type === "er-aggregate") {
    const name = freeName(entityNames, shape.name);
    entityNames.push({ name });
    if (name === shape.name) return {};
    if (shape.type === "er-aggregate") return { name };
    const size = entitySize(name);
    return { name, ...size, ...keepCenter(shape, size) };
  }
  if (shape.type === "er-relation") {
    const name = freeName(relationNames, shape.name);
    relationNames.push({ name });
    if (name === shape.name) return {};
    const size = relationSize(name);
    return { name, ...size, ...keepCenter(shape, size) };
  }
  return {};
}
