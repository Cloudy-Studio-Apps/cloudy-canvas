import type { ErElement } from "../base/er.types";
import { isErParticipant } from "../base/is-er-element";
import type { ErDrop, ErPaletteItemId } from "./er-drop.types";
import { OPEN_GATE, type ErConstructGate } from "../base/constructs";
import { PALETTE_CONSTRUCTS } from "./palette-constructs";
import { t } from "../er.i18n";

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
  gate: ErConstructGate = OPEN_GATE,
): ErDrop {
  // What the standard forbids isn't dropped (an attribute on a relation is a relation attribute).
  const onRelation =
    hit?.type === "er-relation" && (item === "attribute" || item === "key-attribute");
  const construct = onRelation ? "relation-attributes" : PALETTE_CONSTRUCTS[item];
  if (construct && !gate.allows(construct)) return { ok: false, label: gate.reason(construct) };
  return plan(item, hit, diagram);
}

function plan(item: ErPaletteItemId, hit: ErElement | undefined, diagram: string): ErDrop {
  const target = hit;
  const own = hit?.diagram ?? diagram;
  switch (item) {
    case "entity":
    case "weak-entity": {
      const weak = item === "weak-entity";
      const label = weak ? t("drop.weakEntity") : t("drop.entity");
      if (target?.type === "er-isa" && !weak) {
        return {
          ok: true,
          label: t("drop.childOfHierarchy"),
          run: (er, at) => er.diagram(own).edits.addIsaChildEntity(target.id, { at }),
        };
      }
      if (!diagram) {
        return {
          ok: true,
          label: t("drop.newDiagram", { label }),
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
    case "associative": {
      const associative = item === "associative";
      const noun = associative ? t("drop.associative") : t("drop.relation");
      if (target && isErParticipant(target) && "name" in target) {
        return {
          ok: true,
          label: t("drop.from", { noun, name: target.name }),
          run: (er, at) => er.diagram(own).edits.addRelation([target.id], { at, associative }),
        };
      }
      if (!diagram) return { ok: false, label: t("drop.onEntityFirst") };
      return {
        ok: true,
        label: noun,
        run: (er, at) => er.diagram(diagram).edits.addRelation([], { at, associative }),
      };
    }
    case "attribute":
    case "key-attribute": {
      const key = item === "key-attribute" ? "pk" : "none";
      const noun = key === "pk" ? t("drop.keyAttribute") : t("drop.attribute");
      if (!target || !ATTRIBUTE_OWNERS.has(target.type)) {
        return {
          ok: false,
          label: key === "pk" ? t("drop.onOwnerKey") : t("drop.onOwner"),
        };
      }
      return {
        ok: true,
        label: t("drop.attributeOf", { noun, name: nameOf(target) }),
        run: (er, at) => er.diagram(own).edits.addAttribute(target.id, { at, key }),
      };
    }
    case "isa":
      if (target?.type !== "er-entity") {
        return { ok: false, label: t("drop.isaNeedsEntity") };
      }
      return {
        ok: true,
        label: t("drop.isaUnder", { name: target.name }),
        run: (er, at) => er.diagram(own).edits.addIsa(target.id, { at }),
      };
    case "union":
      if (target?.type !== "er-entity") {
        return { ok: false, label: t("drop.unionNeedsEntity") };
      }
      return {
        ok: true,
        label: t("drop.unionOf", { name: target.name }),
        run: (er, at) => er.diagram(own).edits.addUnion(target.id, { at }),
      };
    case "aggregate":
      if (target?.type !== "er-relation") {
        return { ok: false, label: t("drop.aggregateNeedsRelation") };
      }
      return {
        ok: true,
        label: t("drop.aggregationOf", { name: target.name }),
        run: (er) => er.diagram(own).edits.addAggregate(target.id),
      };
    case "constraint":
      return { ok: false, label: t("drop.constraintClick") };
  }
}

function nameOf(el: ErElement): string {
  if ("name" in el && el.name) return el.name;
  return el.type === "er-isa" ? t("drop.theHierarchy") : t("drop.it");
}
