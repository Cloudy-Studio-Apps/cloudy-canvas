import type { CanvasDocument } from "../../document";
import type { ElementPatch } from "../../elements/element.types";
import type { TokenRecord } from "../../tokens/token.types";
import { withFileView } from "../axis-view";
import type { LibraryDocument } from "../library-document";
import { taggedRecord } from "../library-tags";
import { writeUntracked } from "../untracked";
import type { MergePlan } from "./library-merge.types";
import { mergedRecords } from "./merged-records";

/**
 * Carries out `plan` (from `planLibraryMerge` over this file and `library`, with its clashes'
 * choices): the library gets the file's new records, then the file holds the library's records
 * tagged as a mirror stores them (so the first mirror changes nothing; each axis keeps the mode
 * the file showed), its layers bound to a record that was merged or replaced ("Use project's")
 * are bound to the library's, pages and frames picking a merged axis's mode pick the library
 * axis's, and the file's records that were merged, replaced or dropped leave it. One untracked
 * transaction: the after-edit hook (the token sync) updates the layers whose values changed.
 * Pictures are moved separately (`moveAssetToLibrary`).
 */
export function applyLibraryMerge(
  doc: CanvasDocument,
  library: LibraryDocument,
  plan: MergePlan,
): void {
  const file = doc.tokenRecords();
  const { puts, idOf, modeOf, leaving } = mergedRecords(file, library.tokenRecords(), plan);
  if (puts.length > 0) library.setTokenRecords(puts);

  // A merged axis shows, in the file, the library mode named like the one it showed.
  const views = new Map<string, TokenRecord>();
  for (const record of file) {
    if (record.kind !== "axis" || !(record.id in plan.axisMap)) continue;
    const view = { ...record, current: record.current && modeOf(record.current) };
    if (!view.current) delete view.current;
    views.set(idOf(record.id), view);
  }
  const mirrored = library
    .tokenRecords()
    .map((record) =>
      withFileView(
        taggedRecord(record, library.id),
        views.get(record.id) ?? doc.tokenRecord(record.id),
      ),
    );

  writeUntracked(doc, () => {
    doc.setTokenRecords(mirrored);
    const patches = rebindPatches(doc, idOf, modeOf, plan.axisMap);
    if (patches.size > 0) doc.updateMany(patches);
    if (leaving.length > 0) doc.removeTokenRecords(leaving);
  });
}

/** The elements' bindings and mode picks in the library's terms, for those that change. */
function rebindPatches(
  doc: CanvasDocument,
  idOf: (id: string) => string,
  modeOf: (id: string) => string,
  axisMap: Readonly<Record<string, string>>,
): Map<string, ElementPatch> {
  const patches = new Map<string, ElementPatch>();
  for (const id of doc.ids()) {
    const patch: ElementPatch = {};
    const bindings = doc.field(id, "bindings");
    if (
      isStringRecord(bindings) &&
      Object.values(bindings).some((token) => idOf(token) !== token)
    ) {
      patch.bindings = Object.fromEntries(
        Object.entries(bindings).map(([path, token]) => [path, idOf(token)]),
      );
    }
    const picks = doc.field(id, "variableModes");
    if (isStringRecord(picks) && Object.keys(picks).some((axis) => axis in axisMap)) {
      patch.variableModes = Object.fromEntries(
        Object.entries(picks).map(([axis, mode]) => [axisMap[axis] ?? axis, modeOf(mode)]),
      );
    }
    if (Object.keys(patch).length > 0) patches.set(id, patch);
  }
  return patches;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return typeof value === "object" && value !== null;
}
