import type { CanvasDocument } from "../document";
import type { CanvasElement } from "../elements/element.types";
import { canVaryBy } from "./axis-source";
import { withCollectionSources, withLibraryTag } from "./collection-source";
import { withoutOverrides } from "./token-edits-base";
import { isTokenRecord } from "./is-token-record";
import { TokenStore } from "./token-store";
import type { ModeAxisRecord, TokenRecord } from "./token.types";
import { valueRefs } from "./value-refs";

/**
 * The variables and styles copied elements use, with what they alias (all the way), their
 * collections and their mode axes, so they paste into other files still bound. Empty when they use none.
 */
export function clipboardTokens(
  doc: CanvasDocument,
  elements: readonly CanvasElement[],
): TokenRecord[] {
  const store = TokenStore.of(doc);
  const variables = new Set<string>();
  const queue: string[] = [];
  for (const el of elements) for (const id of Object.values(el.bindings ?? {})) queue.push(id);
  const records: TokenRecord[] = [];
  for (const id of new Set(queue)) {
    const style = store.style(id);
    if (!style) continue;
    records.push(style);
    // The variables a style uses travel with it.
    for (const variable of Object.values(style.bindings ?? {})) queue.push(variable);
  }
  while (queue.length > 0) {
    const id = queue.pop();
    if (id === undefined || variables.has(id)) continue;
    const variable = store.variable(id);
    if (!variable) continue;
    variables.add(id);
    for (const value of Object.values(variable.values)) {
      queue.push(...valueRefs(value));
    }
  }
  const collections = new Set<string>();
  const axes = new Set<string>();
  for (const id of variables) {
    const variable = store.variable(id);
    if (!variable) continue;
    records.push(variable);
    collections.add(variable.collectionId);
    if (variable.axisId) axes.add(variable.axisId);
  }
  for (const id of axes) {
    const axis = store.axis(id);
    if (axis) records.push(axis);
  }
  for (const id of collections) {
    const collection = store.collection(id);
    if (collection) records.push(collection);
  }
  return records;
}

/**
 * Adds the pasted variables and collections the document doesn't have (same id: the document's
 * own are kept, so pasting never changes its values), as part of the edit running now. A record
 * mirrored from a project library keeps its `libraryId` only when the document has records of
 * that library already (it uses it; the next mirror settles them); otherwise it becomes the
 * document's own. Variables pasted into a collection the document has take its source, and a
 * library's variable varying by an axis of another source keeps only its default value.
 */
export function restoreTokens(doc: CanvasDocument, records: readonly unknown[]): void {
  const missing = records.filter(
    (record): record is TokenRecord => isTokenRecord(record) && !doc.tokenRecord(record.id),
  );
  if (missing.length === 0) return;
  const used = new Set(doc.tokenRecords().flatMap((record) => record.libraryId ?? []));
  const tagged = missing.map((record) =>
    record.libraryId === undefined || used.has(record.libraryId)
      ? record
      : withLibraryTag(record, undefined),
  );
  const placed = withCollectionSources(tagged, TokenStore.of(doc));
  // A library's variable can't vary by an axis of another source: it keeps its default only.
  const axes = new Map<string, ModeAxisRecord>();
  for (const record of placed) if (record.kind === "axis") axes.set(record.id, record);
  for (const record of doc.tokenRecords()) {
    if (record.kind === "axis" && !axes.has(record.id)) axes.set(record.id, record);
  }
  doc.setTokenRecords(
    placed.map((record) => {
      if (record.kind !== "variable" || !record.axisId) return record;
      const axis = axes.get(record.axisId);
      return axis && !canVaryBy(record, axis) ? withoutOverrides(record) : record;
    }),
  );
}
