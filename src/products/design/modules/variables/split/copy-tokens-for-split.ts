import { libraryIdOf, type CanvasDocument } from "@canvas";

/**
 * A page split out into a new file keeps its variables and styles: in a project only the file's
 * own (the libraries' come in through the project link), outside one all of them. Nothing when
 * there are none to copy.
 */
export function copyTokensForSplit(
  source: CanvasDocument,
  target: CanvasDocument,
  inProject: boolean,
): void {
  const records = source
    .tokenRecords()
    .filter((record) => !inProject || libraryIdOf(record) === undefined);
  if (records.length > 0) target.setTokenRecordsUntracked(records);
}
