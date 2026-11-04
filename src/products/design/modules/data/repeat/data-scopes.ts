import type { CanvasDocument, CanvasElement } from "@canvas";

import { isDesignNode, type DesignNode } from "../../core";
import { isFrame, type FrameElement } from "../../frame";
import type { DataScope } from "../bindings";
import { dataCopyTag, repeatOf } from "./repeat-fields";
import { repeatRows, rowScope } from "./repeat-rows";
import { rowNames } from "./row-names";
import { templateOf as templateIn } from "./template-of";
import type { DataScopes, IteratorRows } from "./data-scopes.types";

const byIndex = (a: DesignNode, b: DesignNode) =>
  a.index < b.index ? -1 : a.index > b.index ? 1 : 0;

/** The key a template's row scope is kept under (row keys are never empty). */
const TEMPLATE = "";

/**
 * The scopes of a document's layers over `root` (built once by the caller): from a layer up,
 * each ancestor frame with a repeat adds the row the layer belongs to, its copy's row
 * (`dataCopyTag.key`) or, in the template, the preview row (`previewRow` in range, else 0).
 * Another child of an iterator (a detached copy) reads the frame's scope, no row. Each
 * iterator's rows, each row's scope and each layer's scope are made once; the layer tree is
 * read once, and again after `invalidate`.
 */
export function dataScopes(doc: CanvasDocument, root: DataScope): DataScopes {
  let tree: Map<string, DesignNode[]> | null = null;
  const seen = new Map<string, DataScope>();
  const visiting = new Set<string>();
  const iterators = new Map<string, IteratorRows | null>();
  const rowScopes = new Map<string, Map<string, DataScope>>();

  const children = (id: string): readonly DesignNode[] => {
    if (!tree) {
      tree = new Map();
      for (const el of doc.all()) {
        if (!isDesignNode(el) || !el.parentId) continue;
        const list = tree.get(el.parentId);
        if (list) list.push(el);
        else tree.set(el.parentId, [el]);
      }
      for (const list of tree.values()) list.sort(byIndex);
    }
    return tree.get(id) ?? [];
  };

  const templateOf = (frame: FrameElement): DesignNode | null =>
    templateIn(frame, children(frame.id));

  const iterator = (frame: FrameElement): IteratorRows | null => {
    const known = iterators.get(frame.id);
    if (known !== undefined) return known;
    const repeat = repeatOf(frame);
    let out: IteratorRows | null = null;
    if (repeat) {
      const scope = scopeFor(frame);
      const rows = repeatRows(repeat, scope, "design");
      const preview =
        repeat.previewRow !== undefined && repeat.previewRow < rows.rows.length
          ? repeat.previewRow
          : 0;
      const byKey = new Map(rows.rows.map((row) => [row.key, row]));
      const names = rowNames(scope, repeat);
      out = { repeat, scope, rows, byKey, preview, names, template: templateOf(frame) };
    }
    iterators.set(frame.id, out);
    return out;
  };

  /** The scope `child` of `frame` reads: its row's when it's the template or a copy. */
  const inFrame = (frame: FrameElement, child: CanvasElement, base: DataScope): DataScope => {
    const it = iterator(frame);
    if (!it) return base;
    const tag = dataCopyTag(child);
    let key: string;
    if (tag?.iterator === frame.id) key = tag.key;
    else if (child.id === it.template?.id) key = TEMPLATE;
    else return base;
    let mine = rowScopes.get(frame.id);
    if (!mine) rowScopes.set(frame.id, (mine = new Map()));
    const known = mine.get(key);
    if (known) return known;
    // A copy whose row is gone (about to be removed) reads no row: its fields are left alone.
    const row = key === TEMPLATE ? it.rows.rows[it.preview] : it.byKey.get(key);
    const index = row?.index ?? 0;
    const scope = rowScope(it.scope, it.repeat, row?.row, index, it.rows.total, it.names);
    mine.set(key, scope);
    return scope;
  };

  // Read by id and field, so only an iterator and its children are read whole.
  const seenBy = (id: string): DataScope => {
    const known = seen.get(id);
    if (known) return known;
    const parentId = doc.field(id, "parentId");
    let scope = root;
    if (typeof parentId === "string" && !visiting.has(id)) {
      visiting.add(id);
      scope = seenBy(parentId);
      visiting.delete(id);
      if (doc.field(parentId, "repeat") != null) {
        const parent = doc.get(parentId);
        const child = doc.get(id);
        if (isFrame(parent) && child) scope = inFrame(parent, child, scope);
      }
    }
    seen.set(id, scope);
    return scope;
  };
  const scopeFor = (el: CanvasElement): DataScope => seenBy(el.id);

  return {
    scopeFor,
    iterator,
    children,
    templateOf,
    invalidate: (frames = []) => {
      tree = null;
      seen.clear();
      for (const id of frames) {
        iterators.delete(id);
        rowScopes.delete(id);
      }
    },
  };
}
