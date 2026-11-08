import type { CanvasDocument } from "../document";
import { TokenStore } from "../tokens/token-store";
import type { ModeAxisRecord, TokenRecord, VariableRecord } from "../tokens/token.types";
import { valueRefs } from "../tokens/value-refs";
import { libraryIdOf } from "./library-tags";
import type { LibraryMovePlan } from "./move-to-library.types";

/**
 * What moving the file's own variables, collections or styles `ids` to the library `libraryId`
 * moves: a variable or a collection moves the whole collection (its variables, generators and
 * scales), with the file's own axes they (and its shade generators) vary by; a style moves alone. Records already in a
 * library are left out. `blockers` lists what they read that stays behind (aliases, expressions,
 * style bindings or generator bases on the file's own variables, or another library's).
 */
export function planLibraryMove(
  doc: CanvasDocument,
  ids: readonly string[],
  libraryId: string,
): LibraryMovePlan {
  const store = TokenStore.of(doc);
  const moving = new Map<string, TokenRecord>();
  const add = (record: TokenRecord | undefined) => {
    if (record && libraryIdOf(record) === undefined) moving.set(record.id, record);
  };

  const collections = new Set<string>();
  for (const id of ids) {
    const variable = store.variable(id);
    if (variable) collections.add(variable.collectionId);
    else if (store.collection(id)) collections.add(id);
    else add(store.style(id));
  }
  for (const id of collections) add(store.collection(id));
  for (const record of doc.tokenRecords()) {
    if ("collectionId" in record && collections.has(record.collectionId)) add(record);
  }

  const blockers = new Map<string, VariableRecord | ModeAxisRecord>();
  const stays = (record: TokenRecord) =>
    !moving.has(record.id) && libraryIdOf(record) !== libraryId;
  const axes = new Set<string>();
  const reads = new Set<string>();
  for (const record of moving.values()) {
    if (record.kind === "variable") {
      if (record.axisId) axes.add(record.axisId);
      for (const value of Object.values(record.values))
        valueRefs(value).forEach((r) => reads.add(r));
    } else if (record.kind === "style") {
      Object.values(record.bindings ?? {}).forEach((r) => reads.add(r));
    } else if (record.kind === "generator" || record.kind === "scale") {
      if (record.baseVar) reads.add(record.baseVar);
      // A shade generator's own axis (its shades vary by it) goes with it too.
      if (record.kind === "generator" && record.axisId) axes.add(record.axisId);
    }
  }
  for (const id of axes) {
    const axis = store.axis(id);
    if (!axis) continue;
    if (libraryIdOf(axis) === undefined) add(axis);
    else if (stays(axis)) blockers.set(axis.id, axis);
  }
  for (const id of reads) {
    const variable = store.variable(id);
    if (variable && stays(variable)) blockers.set(variable.id, variable);
  }

  const records = [...moving.values()];
  return {
    records,
    collections: records.flatMap((r) => (r.kind === "collection" ? [r] : [])),
    variables: records.filter((r) => r.kind === "variable").length,
    styles: records.flatMap((r) => (r.kind === "style" ? [r] : [])),
    blockers: [...blockers.values()],
  };
}
