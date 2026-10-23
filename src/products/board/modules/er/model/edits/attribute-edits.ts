import { freeName } from "../../../db";
import { createErAttribute } from "../../attribute/attribute.factory";
import type { ErAttributeKey } from "../../attribute/attribute.types";
import { attributeSize } from "../../base/er-size";
import type { ErShapes } from "../lang";
import { replaceIn, resized } from "./edit-helpers";
import type { ErAttributePatch, ErEditResult } from "./edits.types";

/** Adds an attribute (or, with an attribute as owner, a part of a composite one) at the end. */
export function addAttribute(
  shapes: ErShapes,
  ownerId: string,
  key: ErAttributeKey = "none",
): ErEditResult {
  const siblings = shapes.attributes.filter((a) => a.ownerId === ownerId);
  const look = shapes.attributes[0]?.look ?? "ellipse";
  const attribute = {
    ...createErAttribute({ x: 0, y: 0 }, ownerId, freeName(siblings, "attribute"), "", look),
    key,
    order: Math.max(-1, ...siblings.map((a) => a.order)) + 1,
  };
  return { shapes: { ...shapes, attributes: [...shapes.attributes, attribute] }, id: attribute.id };
}

export function updateAttribute(shapes: ErShapes, id: string, patch: ErAttributePatch): ErShapes {
  return {
    ...shapes,
    attributes: replaceIn(shapes.attributes, id, (attribute) => {
      const next = { ...attribute, ...patch };
      return patch.name !== undefined ? resized(next, attributeSize(next.name, next.look)) : next;
    }),
  };
}

/** Removes an attribute and its parts. */
export function removeAttribute(shapes: ErShapes, id: string): ErShapes {
  const gone = new Set([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const a of shapes.attributes) {
      if (!gone.has(a.id) && gone.has(a.ownerId)) {
        gone.add(a.id);
        grew = true;
      }
    }
  }
  return { ...shapes, attributes: shapes.attributes.filter((a) => !gone.has(a.id)) };
}

/** Swaps an attribute with its previous (-1) or next (+1) sibling. */
export function moveAttribute(shapes: ErShapes, id: string, by: -1 | 1): ErShapes {
  const attribute = shapes.attributes.find((a) => a.id === id);
  if (!attribute) return shapes;
  const siblings = shapes.attributes
    .filter((a) => a.ownerId === attribute.ownerId)
    .sort((a, b) => a.order - b.order);
  const at = siblings.findIndex((a) => a.id === id);
  const other = siblings[at + by];
  if (!other) return shapes;
  const orders = new Map(siblings.map((a, i) => [a.id, i]));
  orders.set(id, at + by);
  orders.set(other.id, at);
  return {
    ...shapes,
    attributes: shapes.attributes.map((a) =>
      orders.has(a.id) ? { ...a, order: orders.get(a.id)! } : a,
    ),
  };
}
