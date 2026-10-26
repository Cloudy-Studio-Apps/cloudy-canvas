import { liveScaleRecords, TokenStore, type CanvasDocument } from "@canvas";

/**
 * Makes scales from before live (their steps expressions of their base step, same values),
 * outside the undo history: what a file opens with.
 */
export function migrateLiveScales(doc: CanvasDocument): void {
  const records = liveScaleRecords(TokenStore.of(doc));
  if (records.length > 0) doc.setTokenRecordsUntracked(records);
}
