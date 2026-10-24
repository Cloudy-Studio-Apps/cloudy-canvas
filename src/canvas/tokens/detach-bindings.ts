import type { CanvasDocument } from "../document";
import type { ElementPatch } from "../elements/element.types";
import { BindingIndex } from "./binding-index";

/**
 * Unlinks every element from these variables (they keep the values they show), as part of the
 * edit running now.
 */
export function detachEverywhere(doc: CanvasDocument, variableIds: ReadonlySet<string>): void {
  const index = BindingIndex.of(doc);
  const ids = new Set<string>();
  for (const variable of variableIds) for (const id of index.boundTo(variable)) ids.add(id);
  const patches = new Map<string, ElementPatch>();
  for (const id of ids) {
    const bindings = doc.get(id)?.bindings;
    if (!bindings) continue;
    const kept = Object.fromEntries(
      Object.entries(bindings).filter(([, variable]) => !variableIds.has(variable)),
    );
    patches.set(id, { bindings: kept });
  }
  if (patches.size > 0) doc.updateMany(patches);
}

/**
 * Binds the field at `path` of each element to a variable (`null` unlinks it, keeping its value),
 * as part of the edit running now: the token sync then gives the fields their values.
 */
export function setBindings(
  doc: CanvasDocument,
  ids: readonly string[],
  path: string,
  variableId: string | null,
): void {
  const patches = new Map<string, ElementPatch>();
  for (const id of ids) {
    const el = doc.get(id);
    if (!el) continue;
    const bindings = { ...el.bindings };
    if (variableId === null) {
      if (!(path in bindings)) continue;
      delete bindings[path];
    } else {
      if (bindings[path] === variableId) continue;
      bindings[path] = variableId;
    }
    patches.set(id, { bindings });
  }
  if (patches.size > 0) doc.updateMany(patches);
}
