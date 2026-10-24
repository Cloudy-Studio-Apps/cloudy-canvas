import type { CanvasDocument } from "../document";
import { TokenStore } from "./token-store";

/** The index per document, and whether an element's bindings changed since it was built. */
const indexes = new WeakMap<CanvasDocument, { index: BindingIndex; stale: boolean }>();

function isBindings(value: unknown): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Which elements are bound to which variables, read from the stored `bindings` fields only (no
 * whole elements). Kept per document and built again after an element's bindings change.
 */
export class BindingIndex {
  private readonly users = new Map<string, Set<string>>();

  static of(doc: CanvasDocument): BindingIndex {
    let entry = indexes.get(doc);
    if (!entry) {
      const created = { index: new BindingIndex(doc), stale: false };
      doc.observe((change) => {
        if (change.removed.size > 0) created.stale = true;
        for (const fields of change.fields?.values() ?? []) {
          if (fields === "all" || fields.has("bindings")) created.stale = true;
        }
        if (!change.fields && change.updated.size > 0) created.stale = true;
      });
      entry = created;
      indexes.set(doc, entry);
    } else if (entry.stale) {
      entry.index = new BindingIndex(doc);
      entry.stale = false;
    }
    return entry.index;
  }

  constructor(private readonly doc: CanvasDocument) {
    for (const id of doc.ids()) {
      const bindings = doc.field(id, "bindings");
      if (!isBindings(bindings)) continue;
      for (const variable of Object.values(bindings)) {
        const set = this.users.get(variable) ?? new Set();
        set.add(id);
        this.users.set(variable, set);
      }
    }
  }

  /** The elements bound to a variable directly. */
  boundTo(variableId: string): Set<string> {
    return new Set(this.users.get(variableId) ?? []);
  }

  /**
   * The elements whose values may follow from a change to these token records: bound to one of
   * the variables or styles, to an alias of one, or to a variable varying by an axis among them
   * (its modes or current mode changed).
   */
  affectedBy(tokenIds: Iterable<string>): Set<string> {
    const store = TokenStore.of(this.doc);
    const variables = new Set<string>();
    for (const id of tokenIds) {
      if (store.axis(id)) {
        for (const v of store.variables()) if (v.axisId === id) variables.add(v.id);
      } else variables.add(id);
    }
    for (const id of [...variables]) {
      for (const dependent of store.aliasDependents(id)) variables.add(dependent);
    }
    // Styles using a changed variable restyle the layers using them.
    for (const id of [...variables]) {
      for (const style of store.styleUsers(id)) variables.add(style);
    }
    const found = new Set<string>();
    for (const id of variables) for (const user of this.users.get(id) ?? []) found.add(user);
    return found;
  }
}
