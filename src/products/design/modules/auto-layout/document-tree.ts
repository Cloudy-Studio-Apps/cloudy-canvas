import { compareByIndex, type CanvasDocument } from "@canvas";

import { isDesignNode, type DesignNode } from "../core";
import type { LayoutTree } from "./layout-tree.types";

/**
 * The document's tree as `layoutFrame`'s callers read it mid-edit: nodes read fresh each time
 * (the layout writes as it goes), children found through an index of parents built on first use
 * from the stored `parentId`s (the layout never changes parents).
 */
export class DocumentTree implements LayoutTree {
  private parents: Map<string, string[]> | null = null;

  constructor(private readonly doc: CanvasDocument) {}

  get(id: string): DesignNode | undefined {
    const el = this.doc.get(id);
    return el && isDesignNode(el) ? el : undefined;
  }

  children(id: string): DesignNode[] {
    return (this.index().get(id) ?? [])
      .map((child) => this.get(child))
      .filter((child) => child !== undefined)
      .sort(compareByIndex);
  }

  /** The ids plus everything they hold. */
  withDescendants(id: string): string[] {
    const all = [id];
    for (let i = 0; i < all.length; i++) all.push(...(this.index().get(all[i]!) ?? []));
    return all;
  }

  private index(): Map<string, string[]> {
    if (this.parents) return this.parents;
    this.parents = new Map();
    for (const id of this.doc.ids()) {
      const parent = this.doc.field(id, "parentId");
      if (typeof parent !== "string") continue;
      const list = this.parents.get(parent);
      if (list) list.push(id);
      else this.parents.set(parent, [id]);
    }
    return this.parents;
  }
}
