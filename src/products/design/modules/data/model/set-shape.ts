import type { CanvasDocument, ElementPatch } from "@canvas";

// A leaf of `repeat/`, as the source rename imports `renameReferences`: no index cycles.
import { renameFieldReferences } from "../repeat/rename-field-references";
import { isDataSource, type DataField, type DataSourceElement } from "../source";
import {
  checkShape,
  fieldPaths,
  guessFields,
  isIncluded,
  isPlainShape,
  normalizePath,
  readShape,
  shapeRenames,
  shapeRows,
  SHAPE_ERRORS,
  type DataRow,
  type DataShape,
} from "../table";
import { addSnapshot, encodeRows, readSnapshotRows } from "../update";

const { unreadable: UNREADABLE, changed: CHANGED } = SHAPE_ERRORS;

function record(doc: CanvasDocument, id: string): DataSourceElement {
  const el = doc.get(id);
  if (!el || !isDataSource(el)) throw new Error(`There's no data source with the id "${id}".`);
  return el;
}

/** The fields the shaped rows have: the known ones under their new paths, those left out gone. */
function shapedFields(
  rows: DataRow[],
  fields: readonly DataField[],
  renames: ReadonlyMap<string, string>,
  shape: DataShape | null,
): DataField[] {
  const kept = fields
    .map((field) => {
      const path = renames.get(normalizePath(field.path));
      return path === undefined ? field : { ...field, path };
    })
    .filter((field) => isIncluded(field.path, shape));
  return guessFields(rows, kept);
}

/**
 * Sets a source's shape step (`null` removes it) in one undo step, without fetching: the rows as
 * read are kept in the snapshot (`readSnapshotRows`' `raw`), shaped again into a new snapshot
 * (the same one when nothing changes), and everything reading a renamed field follows it
 * (`renameFieldReferences`, before the record changes). The shape is checked first (`readShape`,
 * `checkShape` over the fields the rows have), so nothing is written when it's refused.
 */
export async function setShape(
  doc: CanvasDocument,
  id: string,
  given: DataShape | null,
): Promise<void> {
  const source = record(doc, id);
  const shape = readShape(given);
  if (JSON.stringify(shape) === JSON.stringify(source.shape ?? null)) return;
  const read = readSnapshotRows(doc, source.snapshot);
  if (!read) throw new Error(UNREADABLE);
  if (shape) checkShape(shape, fieldPaths(read.raw));
  const rows = shapeRows(read.raw, shape);
  const raw = isPlainShape(shape) ? undefined : read.raw;
  const encoded = source.snapshot ? await encodeRows(rows, raw) : null;

  // Read again: the record may have changed (an Update) while encoding.
  const current = record(doc, id);
  if (current.snapshot?.assetId !== source.snapshot?.assetId) throw new Error(CHANGED);
  if (JSON.stringify(current.shape ?? null) !== JSON.stringify(source.shape ?? null)) {
    throw new Error(CHANGED);
  }
  const renames = shapeRenames(current.shape, shape);
  const previous = current.snapshot;
  // The new asset is added before the checkpoint (assets are outside undo), as an Update does.
  const snapshot =
    previous && encoded && encoded.hash !== previous.hash
      ? {
          ...previous,
          ...addSnapshot(doc, rows, encoded, raw),
          updatedAt: previous.updatedAt,
          previous: previous.assetId,
        }
      : previous;
  const patch: ElementPatch<DataSourceElement> = {
    shape,
    snapshot,
    fields: shapedFields(rows, current.fields, renames, shape),
  };
  doc.checkpoint();
  doc.batch(() => {
    renameFieldReferences(doc, current, renames);
    doc.update(id, patch);
  });
}
