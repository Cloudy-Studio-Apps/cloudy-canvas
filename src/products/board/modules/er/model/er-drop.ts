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
 * What dropping `item` on `hit` (the ER element under the pointer) does. What attaches to `hit`
 * goes into `hit`'s diagram; the rest into `diagram` (the one shown), or, with none shown, an
 * entity starts a new diagram. Entities and relations go anywhere (an entity dropped on a
 * hierarchy becomes its child, a relation dropped on an entity or aggregation starts from it),
 * attributes need an owner, a hierarchy an entity and an aggregation a relation.
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
      const label = weak ? "Weak entity" : "Entity";
      if (target?.type === "er-isa" && !weak) {
        return {
          ok: true,
          label: "Child entity of the hierarchy",
          run: (er, at) => er.diagram(own).edits.addIsaChildEntity(target.id, { at }),
        };
      }
      if (!diagram) {
        return {
          ok: true,
          label: `${label} (a new diagram)`,
          run: (er, at) => er.newDiagram(at, { weak }),
        };
      }
      return {
        ok: true,
        label,
        run: (er, at) => er.diagram(diagram).edits.addEntity(undefined, { at, weak }),
      };
    }
    case "relation":
      if (target?.type === "er-entity" || target?.type === "er-aggregate") {
        return {
          ok: true,
          label: `Relation from ${target.name}`,
          run: (er, at) => er.diagram(own).edits.addRelation([target.id], { at }),
        };
      }
      if (!diagram) return { ok: false, label: "Drop on an entity, or add an entity first" };
      return {
        ok: true,
        label: "Relation",
        run: (er, at) => er.diagram(diagram).edits.addRelation([], { at }),
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
        label: `${noun} of ${nameOf(target)}`,
        run: (er, at) => er.diagram(own).edits.addAttribute(target.id, { at, key }),
      };
    }
    case "isa":
      if (target?.type !== "er-entity") {
        return { ok: false, label: "Drop on an entity to add a hierarchy under it" };
      }
      return {
        ok: true,
        label: `Hierarchy under ${target.name}`,
        run: (er, at) => er.diagram(own).edits.addIsa(target.id, { at }),
      };
    case "aggregate":
      if (target?.type !== "er-relation") {
        return { ok: false, label: "Drop on a relation to aggregate it" };
      }
      return {
        ok: true,
        label: `Aggregation of ${target.name}`,
        run: (er) => er.diagram(own).edits.addAggregate(target.id),
      };
    case "constraint":
      return { ok: false, label: "Click to add a constraint between two relations" };
  }
}

function nameOf(el: ErElement): string {
  if ("name" in el && el.name) return el.name;
  return el.type === "er-isa" ? "the hierarchy" : "it";
}
