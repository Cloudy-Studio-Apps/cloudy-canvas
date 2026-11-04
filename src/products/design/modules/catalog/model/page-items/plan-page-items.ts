import { nKeysBetween, type CanvasElement, type ElementPatch } from "@canvas";
import { createId } from "@shared/core";

import { isDesignNode, type DesignNode } from "../../../core";
import { isText } from "../../../text";
import { copyOf, copyPatch } from "./copy-node";
import { itemTextPatch } from "./item-text-patch";
import { pageItemTag, pageItemTemplate } from "./page-item-fields";
import type { PageItemTag } from "./page-item.types";
import { resolveTemplate } from "./resolve-template";
import type { StampTarget } from "./stamp-targets.types";
import type { PageItemPlan, PlanBrochure, PlanInput } from "./plan-page-items.types";

const keyOf = (frame: string, source: string, half?: string) => `${frame}|${source}|${half ?? ""}`;

/** The ids under `id`, parents before their children. */
function descendants(children: PlanInput["children"], id: string): string[] {
  const out: string[] = [];
  const queue = [...(children.get(id) ?? [])];
  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    out.push(next);
    queue.push(...(children.get(next) ?? []));
  }
  return out;
}

/**
 * What a design page needs written so each of its brochures' pages show their masters: a
 * locked, tagged copy of each master layer on each page (matched to the copy already there by
 * brochure, frame, source and half, and patched with what changed; on top of the page's own
 * layers when new), its page items' texts read for the page, and every other copy on the page
 * removed (a master, page or brochure no longer used, another brochure's on a frame the open one
 * takes, a copy repeated by a race). Pure: it only reads.
 */
export function planPageItems(input: PlanInput): PageItemPlan {
  const { brochures, byId, children } = input;
  const plan: PageItemPlan = { add: [], update: new Map(), remove: [] };
  const existing = new Map<string, CanvasElement>();
  const used = new Set<string>();
  // Each frame's brochure (the last to use it) and its sides there.
  const byFrame = new Map<string, { owner: PlanBrochure; parts: StampTarget[] }>();
  for (const owner of brochures) {
    const mine = new Map<string, StampTarget[]>();
    for (const target of owner.targets) {
      const list = mine.get(target.frame.id);
      if (list) list.push(target);
      else mine.set(target.frame.id, [target]);
    }
    for (const [frameId, parts] of mine) byFrame.set(frameId, { owner, parts });
  }
  // Copies already on the page's frames, by what they copy (the first of repeats wins).
  for (const [frameId, { owner }] of byFrame) {
    for (const id of descendants(children, frameId)) {
      const el = byId.get(id);
      const tag = pageItemTag(el);
      const key =
        tag && tag.brochure === owner.record.id ? keyOf(frameId, tag.source, tag.half) : null;
      if (el && key && !existing.has(key)) existing.set(key, el);
    }
  }

  for (const [frameId, { owner, parts }] of byFrame) {
    const { record, context } = owner;
    const frame = parts[0]?.frame;
    if (!frame) continue;
    const fresh: DesignNode[] = [];
    for (const part of parts) {
      const shown = part.master;
      if (!shown) continue;
      const master = shown.frame;
      const move = { dx: frame.x + part.offsetX - master.x, dy: frame.y - master.y };
      const stamp = (parentSource: string, parentCopy: string) => {
        for (const sourceId of children.get(parentSource) ?? []) {
          const source = byId.get(sourceId);
          if (!source || !isDesignNode(source) || part.skip.has(sourceId)) continue;
          const tag: PageItemTag = {
            brochure: record.id,
            master: shown.record.id,
            source: sourceId,
            ...(part.half ? { half: part.half } : {}),
          };
          const old = existing.get(keyOf(frameId, sourceId, part.half));
          const want = copyOf(
            source,
            { ...move, parentId: parentCopy, pageId: frame.pageId },
            tag,
            { ...context, info: part.info },
            old?.type === source.type ? old : undefined,
          );
          let id: string;
          if (old && old.type === source.type && !used.has(old.id)) {
            id = old.id;
            used.add(id);
            const patch = copyPatch(old, want);
            if (patch) plan.update.set(id, patch as ElementPatch);
          } else {
            id = createId();
            const copy = { ...want, id } as DesignNode;
            if (parentCopy === frameId) fresh.push(copy);
            else plan.add.push(copy);
          }
          stamp(sourceId, id);
        }
      };
      stamp(master.id, frameId);
    }
    // New copies go on top of the page's own layers, in the master's order.
    if (fresh.length > 0) {
      const top = (children.get(frameId) ?? [])
        .map((id) => byId.get(id)?.index ?? "")
        .reduce((a, b) => (b > a ? b : a), "");
      const keys = nKeysBetween(top || null, null, fresh.length);
      plan.add.unshift(...fresh.map((copy, i) => ({ ...copy, index: keys[i] ?? copy.index })));
    }
    // The page's own page items (dropped on it, or detached) read for the half they're on.
    for (const id of descendants(children, frameId)) {
      const el = byId.get(id);
      const template = pageItemTemplate(el);
      if (!el || !isText(el) || template === null || pageItemTag(el)) continue;
      const middle = el.x + el.w / 2;
      const part = parts.find((p) => p.half !== "left" || middle < frame.x + frame.w / 2);
      if (!part) continue;
      const patch = itemTextPatch(el, resolveTemplate(template, { ...context, info: part.info }));
      if (patch) plan.update.set(id, patch as ElementPatch);
    }
  }

  for (const el of byId.values()) {
    if (pageItemTag(el) && !used.has(el.id)) plan.remove.push(el.id);
  }
  return plan;
}
