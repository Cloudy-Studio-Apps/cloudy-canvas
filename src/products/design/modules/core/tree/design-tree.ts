import {
  changesOnly,
  defineService,
  DocumentFeed,
  GEOMETRY_FIELDS,
  type CanvasDocument,
} from "@canvas";

import { isDesignNode, type DesignNode } from "../node";
import type { LayerTree } from "./design-tree.types";

/**
 * The layer tree as the layers panel reads it: each parent's children, topmost first. Observes
 * the document only while something subscribes (`subscribe`/`getVersion` work with React's
 * `useSyncExternalStore`), so it needs no cleanup. Reads are fresh each time; callers cache them
 * by version.
 */
export class DesignTree {
  private readonly feed: DocumentFeed;

  constructor(private readonly doc: CanvasDocument) {
    // Moving and resizing layers changes nothing they list.
    this.feed = new DocumentFeed(doc, (change) => !changesOnly(change, GEOMETRY_FIELDS));
  }

  subscribe = (listener: () => void): (() => void) => this.feed.subscribe(listener);

  getVersion = (): number => this.feed.getVersion();

  /**
   * Every parent's children (`null`: the top of the page), topmost first: the nodes on `page`
   * (the one on screen, `engine.scope`), or on every page when it's `null`.
   */
  layers(page: string | null): LayerTree {
    const nodes = this.doc
      .all()
      .filter((el): el is DesignNode => isDesignNode(el) && (page === null || el.pageId === page));
    const ids = new Set(nodes.map((node) => node.id));
    const children = new Map<string | null, DesignNode[]>();
    for (const node of nodes) {
      // A node whose parent is gone shows at the top, as it's drawn.
      const parent = node.parentId && ids.has(node.parentId) ? node.parentId : null;
      const list = children.get(parent);
      if (list) list.push(node);
      else children.set(parent, [node]);
    }
    for (const list of children.values()) list.sort((a, b) => (a.index < b.index ? 1 : -1));
    return children;
  }

  node(id: string): DesignNode | undefined {
    const el = this.doc.get(id);
    return el && isDesignNode(el) ? el : undefined;
  }

  /** The node's ancestors, nearest first. */
  ancestors(id: string): DesignNode[] {
    const list: DesignNode[] = [];
    const seen = new Set([id]);
    for (let node = this.node(id); node?.parentId && !seen.has(node.parentId);) {
      seen.add(node.parentId);
      node = this.node(node.parentId);
      if (node) list.push(node);
    }
    return list;
  }
}

/** The design's layer tree (`engine.service(DESIGN_TREE)`, `useService` in React). */
export const DESIGN_TREE = defineService("design.tree", (doc) => new DesignTree(doc));
