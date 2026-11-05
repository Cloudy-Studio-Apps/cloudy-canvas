import type { CanvasDocument, CanvasElement } from "@canvas";

import { isDesignNode, type DesignNode } from "../../core";
import { isFrame, type FrameElement } from "../../frame";
import { readsUnreadable } from "../bindings";
import type { DataScope } from "../bindings";
import type { DataPhase } from "../model/shared-state.types";
import { dataCopyTag, repeatOf } from "./repeat-fields";
import { repeatRows, rowScope } from "./repeat-rows";
import { rowNames } from "./row-names";
import { templateOf as templateIn } from "./template-of";
import type { LoopsAround, DataScopes, IteratorRows } from "./data-scopes.types";
import { ancestorChain } from "./ancestor-chain";
import type { ScopeLayer } from "./scope-layer.types";
import { byIndex } from "./by-index";
import { dataAround } from "./data-around";
import { layeredScope } from "./layered-scope";

/** The key a template's row scope is kept under (row keys are never empty). */
const TEMPLATE = "";

/**
 * The scopes of a document's layers over `root` (built once by the caller): a top-level frame
 * reads the loops other modules put around it (`dataScopeProviders`, asked once per frame, layered
 * over `root` with `layeredScope`), and from a layer up, each ancestor frame with a repeat adds the
 * row the layer belongs to, its copy's row (`dataCopyTag.key`) or, in the template, the preview
 * row (`previewRow` in range, else 0). Another child of an iterator (a detached copy) reads the
 * frame's scope, no row. Each iterator's rows (`repeatRows` in `phase`), each row's scope and each
 * layer's scope are made once; the layer tree is read once, and again after `invalidate`.
 */
export function dataScopes(
  doc: CanvasDocument,
  root: DataScope,
  phase: DataPhase = "design",
): DataScopes {
  const around = dataAround();
  let tree: Map<string, DesignNode[]> | null = null;
  const seen = new Map<string, DataScope>();
  /** Each layer's top-level ancestor (itself at the top), found with its scope. */
  const tops = new Map<string, string>();
  const arounds = new Map<string, LoopsAround>();
  const locales = new Map<string, string | null>();
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
      const rows = repeatRows(repeat, scope, phase);
      const preview =
        repeat.previewRow !== undefined && repeat.previewRow < rows.rows.length
          ? repeat.previewRow
          : 0;
      const byKey = new Map(rows.rows.map((row) => [row.key, row]));
      const names = rowNames(scope, repeat);
      const unreadable = readsUnreadable(scope, repeat.source);
      out = { repeat, scope, rows, byKey, preview, names, template: templateOf(frame), unreadable };
    }
    iterators.set(frame.id, out);
    return out;
  };

  /** The row key `child` of `frame` shows: a copy's, `TEMPLATE` for the template, else `null`. */
  const keyIn = (frame: FrameElement, child: CanvasElement, it: IteratorRows): string | null => {
    const tag = dataCopyTag(child);
    if (tag?.iterator === frame.id) return tag.key;
    return child.id === it.template?.id ? TEMPLATE : null;
  };
  const rowAt = (it: IteratorRows, key: string) =>
    key === TEMPLATE ? it.rows.rows[it.preview] : it.byKey.get(key);

  /** The scope `child` of `frame` reads: its row's when it's the template or a copy. */
  const inFrame = (frame: FrameElement, child: CanvasElement, base: DataScope): DataScope => {
    const it = iterator(frame);
    if (!it) return base;
    let key = keyIn(frame, child, it);
    if (key === null) return base;
    let mine = rowScopes.get(frame.id);
    if (!mine) rowScopes.set(frame.id, (mine = new Map()));
    // A list this device can't read: every row reads as unreadable, so what reads it is left alone.
    if (it.unreadable) key = TEMPLATE;
    const known = mine.get(key);
    if (known) return known;
    if (it.unreadable) {
      const names = [it.repeat.as, "$index", "$number", "$count"];
      const scope: DataScope = {
        names: {},
        parent: it.scope,
        fields: new Map(),
        sources: new Map(),
        unreadable: new Set(names),
      };
      mine.set(key, scope);
      return scope;
    }
    // A copy whose row is gone (about to be removed) reads no row: its fields are left alone.
    const row = rowAt(it, key);
    const index = row?.index ?? 0;
    const scope = rowScope(it.scope, it.repeat, row?.row, index, it.rows.total, it.names);
    mine.set(key, scope);
    return scope;
  };

  /** The loops the providers put around a top-level frame, asked once per frame. */
  const aroundOf = (id: string): LoopsAround => {
    const known = arounds.get(id);
    if (known) return known;
    let out: LoopsAround = { layers: [], scope: root };
    if (around.scopes.length > 0 && typeof doc.field(id, "parentId") !== "string") {
      const frame = doc.get(id);
      if (isFrame(frame)) {
        const layers = around.scopes.flatMap((provide) => provide(doc, frame, root) ?? []);
        if (layers.length > 0) out = { layers, scope: layeredScope(root, layers) };
      }
    }
    arounds.set(id, out);
    return out;
  };

  // Read by id and field, so only an iterator and its children are read whole.
  const seenBy = (id: string): DataScope => {
    const known = seen.get(id);
    if (known) return known;
    const parentId = doc.field(id, "parentId");
    let scope = root;
    let top = id;
    if (typeof parentId !== "string") scope = aroundOf(id).scope;
    else if (!visiting.has(id)) {
      visiting.add(id);
      scope = seenBy(parentId);
      visiting.delete(id);
      top = tops.get(parentId) ?? parentId;
      if (doc.field(parentId, "repeat") != null) {
        const parent = doc.get(parentId);
        const child = doc.get(id);
        if (isFrame(parent) && child) scope = inFrame(parent, child, scope);
      }
    }
    seen.set(id, scope);
    tops.set(id, top);
    return scope;
  };
  const scopeFor = (el: CanvasElement): DataScope => seenBy(el.id);
  const topOf = (id: string): string => {
    seenBy(id);
    return tops.get(id) ?? id;
  };

  /** The loop `frame` is for `child` (its template or a copy) as a `ScopeLayer`, else `null`. */
  const loopLayer = (frame: CanvasElement, child: CanvasElement): ScopeLayer | null => {
    if (!isFrame(frame)) return null;
    const it = iterator(frame);
    const key = it ? keyIn(frame, child, it) : null;
    if (!it || key === null) return null;
    const row = it.unreadable ? undefined : rowAt(it, key);
    return {
      name: it.repeat.as,
      value: row?.row,
      owner: frame.id,
      label: frame.name,
      index: row?.index ?? 0,
      count: it.rows.total,
      names: it.names,
      ...(it.unreadable ? { unreadable: true } : {}),
    };
  };

  const layersFor = (el: CanvasElement): ScopeLayer[] => {
    const chain = ancestorChain(doc, el);
    const out = [...aroundOf((chain[chain.length - 1] as CanvasElement).id).layers];
    for (let i = chain.length - 1; i > 0; i--) {
      const layer = loopLayer(chain[i] as CanvasElement, chain[i - 1] as CanvasElement);
      if (layer) out.push(layer);
    }
    return out;
  };

  const localeFor = (el: CanvasElement): string | null => {
    if (around.locales.length === 0) return null;
    const top = topOf(el.id);
    const known = locales.get(top);
    if (known !== undefined) return known;
    const node = doc.get(top);
    let found: string | null = null;
    if (node && isDesignNode(node)) {
      for (const provide of around.locales) {
        found = provide(doc, node);
        if (found) break;
      }
    }
    locales.set(top, found);
    return found;
  };

  return {
    root,
    scopeFor,
    layersFor,
    localeFor,
    iterator,
    children,
    templateOf,
    invalidate: (frames = []) => {
      tree = null;
      seen.clear();
      tops.clear();
      for (const id of frames) {
        iterators.delete(id);
        rowScopes.delete(id);
      }
    },
  };
}
