import type { ElementPatch } from "@canvas";
import { createId } from "@shared/core";

import type { DesignNode } from "../../../core";
import {
  dataCopyTag,
  dataResolvedPaths,
  layoutPlacedPaths,
  templateCopyParts,
} from "../../../data";
import { pageItemTemplate } from "../page-items/page-item-fields";
import { pageCopyPatch } from "./page-copy-patch";
import { repeatCopyTag } from "./repeat-copy-tag";
import type { RepeatCopyTag } from "./repeat-copy-tag.types";
import type { PageCopyInput, PageCopyPlan } from "./plan-page-copy.types";

/** What the page items sync writes on a page item's text (read for its own page). */
const ITEM_PATHS = ["text", "runs", "w", "h"];

/**
 * Where a page item's copy sits: as its template layer, but a text that grows to its width keeps
 * its aligned edge there (`alignedTextPatch`), as the page items sync keeps it when it reads it.
 */
function itemX(part: DesignNode, old: DesignNode, x: number): number {
  const text = part as unknown as { autoResize?: unknown; textAlign?: unknown };
  if (text.autoResize !== "width") return x;
  const share = text.textAlign === "right" ? 1 : text.textAlign === "center" ? 0.5 : 0;
  return x + (part.w - old.w) * share;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * A template layer as its copy takes it: a card repeater inside names the copy of its card
 * (`repeat.template`), so it repeats its own child.
 */
function sourceFor(part: DesignNode, idFor: ReadonlyMap<string, string>): DesignNode {
  const repeat = (part as unknown as Record<string, unknown>).repeat;
  if (!isRecord(repeat) || typeof repeat.template !== "string") return part;
  const template = idFor.get(repeat.template);
  return template ? ({ ...part, repeat: { ...repeat, template } } as DesignNode) : part;
}

/**
 * What keeps one generated page in step with its template page: each template layer
 * (`templateParts`: master copies and card repeaters' copies are left out, their syncs make them
 * on the page) gets a copy, matched by its tag's `source`, patched where its template layer
 * changed but never in what its data, its layout or its page items write (`dataResolvedPaths`,
 * `layoutPlacedPaths`, a page item's text), each sitting where its template layer does relative
 * to its parent; the page's frame keeps its place. Copies whose template layer went are removed
 * with what they hold. Pure: it only reads.
 */
export function planPageCopy(input: PageCopyInput): PageCopyPlan {
  const { template, tree, copy, existing, tag, at: place } = input;
  const plan: PageCopyPlan = {
    rootId: copy?.id ?? createId(),
    add: [],
    patch: new Map(),
    remove: [],
  };
  const parts = templateCopyParts(template, tree);
  const partById = new Map(parts.map((part) => [part.id, part]));
  const candidates = new Map<string, DesignNode>();
  const mine: DesignNode[] = [];
  const children = new Map<string, DesignNode[]>();
  for (const el of existing) {
    if (el.parentId !== null) {
      const list = children.get(el.parentId);
      if (list) list.push(el);
      else children.set(el.parentId, [el]);
    }
    // A card repeater's copies inside are its own to keep, whatever they carry.
    const own = dataCopyTag(el) ? null : repeatCopyTag(el);
    if (!own) continue;
    mine.push(el);
    if (!candidates.has(own.source)) candidates.set(own.source, el);
  }

  const idFor = new Map<string, string>();
  const at = new Map<string, { x: number; y: number }>();
  const used = new Set<string>();
  const fresh = new Map<string, DesignNode>();
  const kept = new Map<string, { old: DesignNode; part: DesignNode; keep: string[] }>();
  for (const part of parts) {
    const isRoot = part === template;
    const parentId = isRoot ? null : idFor.get(part.parentId ?? "");
    if (parentId === undefined) continue;
    const parentPart = isRoot ? null : (partById.get(part.parentId ?? "") ?? null);
    const parentAt = isRoot ? null : at.get(part.parentId ?? "");
    const x = parentPart && parentAt ? parentAt.x + part.x - parentPart.x : place.x;
    const y = parentPart && parentAt ? parentAt.y + part.y - parentPart.y : place.y;
    const old = isRoot ? copy : candidates.get(part.id);
    if (old && old.type === part.type && !used.has(old.id)) {
      used.add(old.id);
      idFor.set(part.id, old.id);
      const keep = [...dataResolvedPaths(part), ...layoutPlacedPaths(part, parentPart)];
      const item = pageItemTemplate(part) !== null;
      if (item) keep.push(...ITEM_PATHS);
      at.set(part.id, {
        x: isRoot || keep.includes("x") ? old.x : item ? itemX(part, old, x) : x,
        y: isRoot || keep.includes("y") ? old.y : y,
      });
      kept.set(part.id, { old, part, keep });
      continue;
    }
    const id = isRoot ? plan.rootId : createId();
    const node = {
      ...part,
      id,
      parentId,
      pageId: template.pageId,
      locked: true,
      repeatCopy: { ...tag, source: part.id } satisfies RepeatCopyTag,
      x,
      y,
    } as DesignNode;
    delete (node as { dataCopy?: unknown }).dataCopy;
    delete (node as { catalogCopy?: unknown }).catalogCopy;
    idFor.set(part.id, id);
    at.set(part.id, { x, y });
    fresh.set(part.id, node);
  }

  // Card repeaters name their card's copy, now that every copy has its id.
  for (const part of parts) {
    const added = fresh.get(part.id);
    if (added) {
      const want = sourceFor(part, idFor);
      plan.add.push(
        want === part
          ? added
          : ({ ...added, repeat: (want as { repeat?: unknown }).repeat } as DesignNode),
      );
      continue;
    }
    const entry = kept.get(part.id);
    if (!entry) continue;
    const { old, keep } = entry;
    const isRoot = part === template;
    const parentId = isRoot ? null : (idFor.get(part.parentId ?? "") ?? null);
    const spot = at.get(part.id);
    const patch = pageCopyPatch(
      old,
      sourceFor(part, idFor),
      {
        parentId,
        pageId: template.pageId,
        tag: { ...tag, source: part.id },
        x: isRoot ? null : (spot?.x ?? null),
        y: isRoot ? null : (spot?.y ?? null),
        index: isRoot ? null : part.index,
      },
      keep,
    );
    if (patch) plan.patch.set(old.id, patch as ElementPatch);
  }

  // Every copy layer not kept goes, with what it holds but the layers kept (moved out of it).
  const removed = new Set<string>();
  for (const el of mine) {
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
