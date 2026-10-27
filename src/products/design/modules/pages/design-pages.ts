import { generateKeyBetween } from "fractional-indexing";

import {
  changesOnly,
  cloneElements,
  defineService,
  DocumentFeed,
  GEOMETRY_FIELDS,
  type CanvasDocument,
  type ElementPatch,
} from "@canvas";

import { isDesignNode, withDescendants, type DesignNode } from "../core";
import { createPage, type PageElement } from "./page";
import { pagesOf } from "./pages-of";
import { t } from "./pages.i18n";

/**
 * The design's pages, and the only place that edits them (each edit is one undo step). Which page
 * is on screen is the engine's (`engine.scope`, `engine.setScope`). Hidden pages (see
 * `PageElement.hidden`) aren't among them: a feature keeps those itself. Observes the document only
 * while something subscribes (`subscribe`/`getVersion` for `useSyncExternalStore`), so it needs
 * no cleanup.
 */
export class DesignPages {
  private readonly feed: DocumentFeed;

  constructor(private readonly doc: CanvasDocument) {
    // Moving and resizing layers changes nothing they list.
    this.feed = new DocumentFeed(doc, (change) => !changesOnly(change, GEOMETRY_FIELDS));
  }

  subscribe = (listener: () => void): (() => void) => this.feed.subscribe(listener);

  getVersion = (): number => this.feed.getVersion();

  /** The pages, in order. */
  pages(): PageElement[] {
    return pagesOf(this.doc);
  }

  page(id: string): PageElement | undefined {
    return this.pages().find((page) => page.id === id);
  }

  /** The nodes on a page, bottom to top. */
  nodes(pageId: string): DesignNode[] {
    return this.doc
      .all()
      .filter((el): el is DesignNode => isDesignNode(el) && el.pageId === pageId);
  }

  /** Adds a page after `after` (or last), named "Page N" unless `name` is given. Returns it. */
  add(after: string | null = null, name?: string): PageElement {
    const page = createPage(name?.trim() || this.nextName(), this.indexAfter(after));
    this.doc.checkpoint();
    this.doc.add(page);
    return page;
  }

  /** Renames a page (an empty name is ignored). */
  rename(id: string, name: string): void {
    const text = name.trim();
    const page = this.page(id);
    if (!page || !text || page.name === text) return;
    this.doc.checkpoint();
    const patch: ElementPatch<PageElement> = { name: text };
    this.doc.update(id, patch);
  }

  /** Adds a copy of a page and everything on it right after it, named "<name> copy". */
  duplicate(id: string): PageElement {
    const source = this.requirePage(id);
    const nodes = this.nodes(id);
    const { copies, ids } = cloneElements(nodes, this.doc.nextIndexes(nodes.length));
    // Frames' guides follow their frames' copies.
    const guides = source.guides?.map((guide) =>
      guide.frame ? { ...guide, frame: ids.get(guide.frame) ?? guide.frame } : guide,
    );
    const copy = {
      ...createPage(`${source.name} copy`, this.indexAfter(id)),
      ...(guides ? { guides } : {}),
    };
    this.doc.checkpoint();
    this.doc.batch(() => {
      this.doc.add(copy);
      for (const node of copies) this.doc.add({ ...node, pageId: copy.id } as DesignNode);
    });
    return copy;
  }

  /** Deletes a page and everything on it. Throws for the last page. */
  remove(id: string): void {
    this.requirePage(id);
    if (this.pages().length <= 1) throw new Error("A design needs at least one page.");
    const nodes = this.nodes(id).map((node) => node.id);
    this.doc.checkpoint();
    this.doc.remove([id, ...nodes]);
  }

  /** Moves a page to `position` (0-based) in the page order. */
  reorder(id: string, position: number): void {
    const page = this.requirePage(id);
    const others = this.pages().filter((other) => other.id !== id);
    const at = Math.max(0, Math.min(Math.round(position), others.length));
    const index = generateKeyBetween(others[at - 1]?.index ?? null, others[at]?.index ?? null);
    if (this.pages().indexOf(page) === at) return;
    this.doc.checkpoint();
    this.doc.update(id, { index });
  }

  /**
   * Moves nodes, with everything they hold, to another page, on top of what's there. Nodes whose
   * parent stays behind go to the top of the page. Returns the ids that moved.
   */
  moveNodes(ids: Iterable<string>, pageId: string): string[] {
    this.requirePage(pageId);
    const all = this.doc.all();
    const moving = withDescendants(new Set(ids), all);
    const nodes = all.filter(
      (el): el is DesignNode => isDesignNode(el) && moving.has(el.id) && el.pageId !== pageId,
    );
    if (nodes.length === 0) return [];
    const moved = new Set(nodes.map((node) => node.id));
    const indexes = this.doc.nextIndexes(nodes.length);
    const patches = new Map<string, ElementPatch>();
    nodes.forEach((node, i) => {
      const keepsParent = node.parentId !== null && moved.has(node.parentId);
      const patch: ElementPatch<DesignNode> = { pageId, index: indexes[i] ?? node.index };
      patches.set(node.id, keepsParent ? patch : { ...patch, parentId: null });
    });
    this.doc.checkpoint();
    this.doc.updateMany(patches);
    return [...moved];
  }

  private requirePage(id: string): PageElement {
    const page = this.page(id);
    if (!page) throw new Error(`There's no page with the id "${id}".`);
    return page;
  }

  /** An index right after `after` in the page order (or after the last page). */
  private indexAfter(after: string | null): string {
    const pages = this.pages();
    const at = after === null ? pages.length - 1 : pages.findIndex((page) => page.id === after);
    const position = at < 0 ? pages.length - 1 : at;
    return generateKeyBetween(pages[position]?.index ?? null, pages[position + 1]?.index ?? null);
  }

  /** "Page N" in the app's language, one past the highest page numbered that way. */
  private nextName(): string {
    const [before = "", after = ""] = t("defaults.page", { number: "\u0000" }).split("\u0000");
    const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const numbered = new RegExp(`^${escape(before)}(\\d+)${escape(after)}$`);
    let highest = 0;
    for (const page of this.pages()) {
      const match = numbered.exec(page.name);
      if (match) highest = Math.max(highest, Number(match[1]));
    }
    return t("defaults.page", { number: Math.max(highest, this.pages().length) + 1 });
  }
}

/** The design's pages (`engine.service(DESIGN_PAGES)`, `useService` in React). */
export const DESIGN_PAGES = defineService("design.pages", (doc) => new DesignPages(doc));
