import type { ErElement } from "../base/er.types";
import type { ErDrop, ErPaletteItemId } from "./er-drop.types";

/** Element types an attribute can belong to. */
const ATTRIBUTE_OWNERS: ReadonlySet<string> = new Set([
  "er-entity",
  "er-relation",
  "er-attribute",
  "er-isa",
  "er-aggregate",
]);

/**
 * What dropping `item` on `hit` (the ER element under the pointer) does, in `diagram` (the one
 * shown) or, when it attaches to `hit`, in `hit`'s:
 * entities and relations go anywhere (an entity dropped on a hierarchy becomes its child, a
 * relation dropped on an entity or aggregation starts from it), attributes need an owner, a hierarchy an entity and an aggregation a relation.
 */
export function erDropPlan(
  item: ErPaletteItemId,
  hit: ErElement | undefined,
  diagram: string,
): ErDrop {
  const target = hit;
  const own = hit?.diagram ?? diagram;
  switch (item) {
    case "entity":
    case "weak-entity": {
      const weak = item === "weak-entity";
      if (target?.type === "er-isa" && !weak) {
        return {
          ok: true,
          diagram: own,
          label: "Child entity of the hierarchy",
          run: (edits, at) => edits.addIsaChildEntity(target.id, { at }),
        };
      }
      return {
        ok: true,
        diagram,
        label: weak ? "Weak entity" : "Entity",
        run: (edits, at) => edits.addEntity(undefined, { at, weak }),
      };
    }
    case "relation":
      if (target?.type === "er-entity" || target?.type === "er-aggregate") {
        return {
          ok: true,
          diagram: own,
          label: `Relation from ${target.name}`,
          run: (edits, at) => edits.addRelation([target.id], { at }),
        };
      }
      return {
        ok: true,
        diagram,
        label: "Relation",
        run: (edits, at) => edits.addRelation([], { at }),
      };
    case "attribute":
    case "key-attribute": {
      const key = item === "key-attribute" ? "pk" : "none";
      const noun = key === "pk" ? "Key attribute" : "Attribute";
      if (!target || !ATTRIBUTE_OWNERS.has(target.type)) {
        return {
          ok: false,
          label: `Drop on an entity or relation to add an ${noun.toLowerCase()}`,
        };
      }
      return {
        ok: true,
        diagram: own,
        label: `${noun} of ${nameOf(target)}`,
        run: (edits, at) => edits.addAttribute(target.id, { at, key }),
      };
    }
    case "isa":
      if (target?.type !== "er-entity") {
        return { ok: false, label: "Drop on an entity to add a hierarchy under it" };
      }
      return {
        ok: true,
        diagram: own,
        label: `Hierarchy under ${target.name}`,
        run: (edits, at) => edits.addIsa(target.id, { at }),
      };
    case "aggregate":
      if (target?.type !== "er-relation") {
        return { ok: false, label: "Drop on a relation to aggregate it" };
      }
      return {
        ok: true,
        diagram: own,
        label: `Aggregation of ${target.name}`,
        run: (edits) => edits.addAggregate(target.id),
      };
    case "constraint":
      return { ok: false, label: "Click to add a constraint between two relations" };
  }
}

function nameOf(el: ErElement): string {
  if ("name" in el && el.name) return el.name;
  return el.type === "er-isa" ? "the hierarchy" : "it";
}
