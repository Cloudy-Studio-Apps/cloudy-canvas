import type { DesignNode } from "../../core";
import type { FrameElement } from "../../frame";
import { copyNode, copyPatch } from "./copy-node";
import { dataResolvedPaths, layoutPlacedPaths } from "./data-resolved-paths";
import { orderKeys } from "./order-keys";
import { dataCopyTag } from "./repeat-fields";
import { templateParts } from "./template-parts";
import type { DataCopyPlan } from "./plan-data-copies.types";
import type { DataCopyTag } from "./repeat.types";

const byIndex = (a: DesignNode, b: DesignNode) =>
  a.index < b.index ? -1 : a.index > b.index ? 1 : 0;

/**
 * What keeps an iterator's copies in step: one copy of the template per row (`rows`: the rows
 * that get a copy, the template's own left out by the caller), matched to the copy there by its
 * row key, its layers to the template's by their tag's `source`. A copy kept is patched where its
 * template part changed, but never in what its data or its layout decides (`dataResolvedPaths`,
 * `layoutPlacedPaths`), which `planBindings` and the auto layout write; its root keeps its place
 * (auto layout moves it), each other layer sits where its template layer does relative to its
 * own parent's copy (where that copy is now, or is being added). Copies of
 * a key gone, the later of a repeated key, and parts the template lost are removed with what they
 * hold. Copies follow row order right after the template, moving as few as can be. A detached
 * key's copy is left alone. Pure: it only reads.
 */
export function planDataCopies(
  frame: FrameElement,
  template: DesignNode,
  templateTree: DesignNode[],
  existing: DesignNode[],
  rows: { key: string; index: number }[],
  detached: string[],
): DataCopyPlan {
  const plan: DataCopyPlan = { add: [], patch: [], remove: [], order: [] };
  const skip = new Set(detached);
  const parts = templateParts(template, templateTree);
  const partById = new Map(parts.map((part) => [part.id, part]));
  const children = new Map<string, DesignNode[]>();
  const mine = new Map<DesignNode, DataCopyTag>();
  for (const el of existing) {
    if (el.parentId !== null) {
      const list = children.get(el.parentId);
      if (list) list.push(el);
      else children.set(el.parentId, [el]);
    }
    const tag = dataCopyTag(el);
    if (tag && tag.iterator === frame.id && !skip.has(tag.key)) mine.set(el, tag);
  }
  const subtree = (root: DesignNode): DesignNode[] => {
    const out = [root];
    for (let i = 0; i < out.length; i++)
      out.push(...(children.get((out[i] as DesignNode).id) ?? []));
    return out;
  };

  const wanted: { key: string; index: number }[] = [];
  const seen = new Set<string>();
  for (const row of [...rows].sort((a, b) => a.index - b.index)) {
    if (skip.has(row.key) || seen.has(row.key)) continue;
    seen.add(row.key);
    wanted.push(row);
  }
  // Each key's root: the first by order of the template's copies on the frame.
  const kept = new Map<string, DesignNode>();
  for (const [el, tag] of [...mine].sort(([a], [b]) => byIndex(a, b))) {
    if (el.parentId !== frame.id || tag.source !== template.id || el.type !== template.type)
      continue;
    if (seen.has(tag.key) && !kept.has(tag.key)) kept.set(tag.key, el);
  }

  const used = new Set<string>();
  const tagFor = (key: string, source: string): DataCopyTag => ({
    iterator: frame.id,
    key,
    source,
  });
  const indexes = orderKeys(
    template.index,
    wanted.map((row) => kept.get(row.key)?.index ?? null),
  );
  wanted.forEach((row, i) => {
    const index = indexes[i] ?? null;
    const root = kept.get(row.key);
    const fresh: DesignNode[] = [];
    const idFor = new Map<string, string>();
    const candidates = new Map<string, DesignNode>();
    if (root) {
      if (index !== null) plan.order.push({ id: root.id, index });
      for (const el of subtree(root)) {
        const tag = mine.get(el);
        if (el !== root && tag?.key === row.key && !candidates.has(tag.source)) {
          candidates.set(tag.source, el);
        }
      }
    }
    // Where each part's copy ends up: a layer sits where its template layer does relative to its
    // own parent (an inner group auto layout moved takes its layers along), the root keeps its place.
    const at = new Map<string, { x: number; y: number }>();
    for (const part of parts) {
      const isRoot = part === template;
      const parentId = isRoot ? frame.id : idFor.get(part.parentId ?? "");
      if (parentId === undefined) continue;
      const templateParent = isRoot ? null : partById.get(part.parentId ?? "");
      const copyParent = isRoot ? null : at.get(part.parentId ?? "");
      const x = templateParent && copyParent ? copyParent.x + part.x - templateParent.x : part.x;
      const y = templateParent && copyParent ? copyParent.y + part.y - templateParent.y : part.y;
      const tag = tagFor(row.key, part.id);
      const old = isRoot ? root : candidates.get(part.id);
      if (old && old.type === part.type && !used.has(old.id)) {
        used.add(old.id);
        idFor.set(part.id, old.id);
        const parent = isRoot ? frame : (partById.get(part.parentId ?? "") ?? null);
        const keep = [...dataResolvedPaths(part), ...layoutPlacedPaths(part, parent)];
        at.set(part.id, {
          x: isRoot || keep.includes("x") ? old.x : x,
          y: isRoot || keep.includes("y") ? old.y : y,
        });
        const patch = copyPatch(
          old,
          part,
          {
            parentId,
            pageId: frame.pageId,
            tag,
            x: isRoot ? null : x,
            y: isRoot ? null : y,
            index: isRoot ? null : part.index,
          },
          keep,
        );
        if (patch) plan.patch.push({ id: old.id, patch });
        continue;
      }
      const copy = copyNode(part, parentId, frame.pageId, tag);
      copy.x = x;
      copy.y = y;
      at.set(part.id, { x, y });
      if (isRoot) copy.index = index ?? copy.index;
      idFor.set(part.id, copy.id);
      fresh.push(copy);
    }
    if (fresh.length > 0) plan.add.push({ key: row.key, index: row.index, nodes: fresh });
  });

  // Every copy layer not kept goes, with what it holds but the layers kept (moved out of it).
  const removed = new Set<string>();
  for (const el of mine.keys()) {
    if (used.has(el.id) || removed.has(el.id)) continue;
    const stack = [el];
    for (let next = stack.pop(); next; next = stack.pop()) {
      if (used.has(next.id) || removed.has(next.id)) continue;
      removed.add(next.id);
      stack.push(...(children.get(next.id) ?? []));
    }
  }
  plan.remove = [...removed];
  return plan;
}
