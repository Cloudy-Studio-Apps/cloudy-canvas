import { createId } from "@shared/core";

import { pairByName } from "../../db/schema/pair-by-name";
import { NO_ER_DIAGRAM } from "../base/no-er-diagram";
import type { ErAggregateElement } from "../aggregate/aggregate.types";
import type { ErConstraintElement } from "../constraint/constraint.types";
import type { ErIsaElement } from "../isa/isa.types";
import type { ErUnionElement } from "../union/union.types";
import { ISA_SIZE, UNION_SIZE } from "../base/er-size";
import { keepCenter } from "../base/keep-center";
import type { ParsedErAggregate, ParsedErConstraint, ParsedErIsa, ParsedErUnion } from "./lang";
import { attributeNamed } from "./lang/parse-attributes";
import { buildAttributes } from "./reconcile-attributes";
import type { ReconcileContext } from "./reconcile-context.types";
import { entityId, relationId } from "./reconcile-names";

/** Hierarchies, matched by their parent's name. The discriminator is an attribute of the triangle. */
export function buildIsas(parsed: readonly ParsedErIsa[], ctx: ReconcileContext): ErIsaElement[] {
  const names = new Map(ctx.existing.entities.map((e) => [e.id, e.name]));
  const existing = ctx.existing.isas.map((isa) => ({ isa, name: names.get(isa.parentId) ?? "" }));
  const pairs = pairByName(
    parsed.map((p) => ({ name: p.parent })),
    existing,
  );
  return parsed.map((item, i): ErIsaElement => {
    const match = pairs.get(i)?.isa;
    const id = match?.id ?? createId();
    if (!match) ctx.added.add(id);
    const discriminator = item.discriminator ? [attributeNamed(item.discriminator, item.line)] : [];
    buildAttributes(
      discriminator,
      id,
      match?.id,
      ctx.existing.attributes,
      ctx.attributes,
      ctx.added,
      ctx.look,
    );
    return {
      id,
      type: "er-isa",
      ...NO_ER_DIAGRAM,
      index: match?.index ?? "",
      ...keepCenter(match, ISA_SIZE),
      ...ISA_SIZE,
      parentId: entityId(ctx, item.parent, item.line),
      parentMin: item.parentMin,
      parentMax: item.parentMax,
      exclusive: item.exclusive,
      total: item.total,
      children: item.children.map((child, k) => ({
        id: match?.children[k]?.id ?? createId(),
        entityId: entityId(ctx, child.entity, child.line),
        min: child.min,
        max: child.max,
      })),
    };
  });
}

export function buildAggregates(
  parsed: readonly ParsedErAggregate[],
  ids: readonly string[],
  ctx: ReconcileContext,
): ErAggregateElement[] {
  return parsed.map((item, i): ErAggregateElement => {
    const id = ids[i]!;
    const match = ctx.existing.aggregates.find((a) => a.id === id);
    buildAttributes(
      item.attributes,
      id,
      match?.id,
      ctx.existing.attributes,
      ctx.attributes,
      ctx.added,
      ctx.look,
    );
    return {
      id,
      type: "er-aggregate",
      ...NO_ER_DIAGRAM,
      index: match?.index ?? "",
      // The bounds are derived from the boxed shapes when the scene refreshes.
      x: match?.x ?? 0,
      y: match?.y ?? 0,
      w: match?.w ?? 0,
      h: match?.h ?? 0,
      name: item.name,
      relationId: relationId(ctx, item.relation, item.line),
    };
  });
}

/** Constraints have no names; they're matched by what they say, then by position. */
export function buildConstraints(
  parsed: readonly ParsedErConstraint[],
  ctx: ReconcileContext,
): ErConstraintElement[] {
  const built = parsed.map((item) => ({
    rule: item.kind,
    entityId: item.entity ? entityId(ctx, item.entity, item.line) : "",
    fromId: relationId(ctx, item.from, item.line),
    toId: relationId(ctx, item.to, item.line),
    min: item.min,
    max: item.max,
  }));
  const keyOf = (c: { rule: string; entityId: string; fromId: string; toId: string }) =>
    `${c.rule}|${c.entityId}|${c.fromId}|${c.toId}`;
  const pairs = pairByName(
    built.map((c) => ({ name: keyOf(c) })),
    ctx.existing.constraints.map((c) => ({ c, name: keyOf(c) })),
  );
  return built.map((item, i): ErConstraintElement => {
    const match = pairs.get(i)?.c;
    const id = match?.id ?? createId();
    if (!match) ctx.added.add(id);
    return {
      id,
      type: "er-constraint",
      ...NO_ER_DIAGRAM,
      index: match?.index ?? "",
      x: match?.x ?? 0,
      y: match?.y ?? 0,
      w: match?.w ?? 0,
      h: match?.h ?? 0,
      ...item,
      points: match?.points ?? [],
    };
  });
}

/** Union types, matched by their category's name. */
export function buildUnions(
  parsed: readonly ParsedErUnion[],
  ctx: ReconcileContext,
): ErUnionElement[] {
  const names = new Map(ctx.existing.entities.map((e) => [e.id, e.name]));
  const existing = ctx.existing.unions.map((union) => ({
    union,
    name: names.get(union.categoryId) ?? "",
  }));
  const pairs = pairByName(
    parsed.map((p) => ({ name: p.category })),
    existing,
  );
  return parsed.map((item, i): ErUnionElement => {
    const match = pairs.get(i)?.union;
    const id = match?.id ?? createId();
    if (!match) ctx.added.add(id);
    return {
      id,
      type: "er-union",
      ...NO_ER_DIAGRAM,
      index: match?.index ?? "",
      ...keepCenter(match, UNION_SIZE),
      ...UNION_SIZE,
      categoryId: entityId(ctx, item.category, item.line),
      superclassIds: item.superclasses.map((s) => entityId(ctx, s.entity, s.line)),
    };
  });
}
