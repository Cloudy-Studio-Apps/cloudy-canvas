import type { CanvasDocument } from "@canvas";
import { createId } from "@shared/core";

import type { DataSnapshot } from "../source";
import type { DataRow } from "../table";
import type { EncodedRows, SnapshotFile } from "./snapshot.types";

/** Parsed rows by asset id: an asset never changes, so each is parsed once. */
const cache = new Map<string, DataRow[]>();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Rows as a snapshot asset's bytes (`{ version: 1, rows }` in UTF-8) and their SHA-256 (hex). */
export async function encodeRows(rows: DataRow[]): Promise<EncodedRows> {
  const file: SnapshotFile = { version: 1, rows };
  const bytes = new TextEncoder().encode(JSON.stringify(file));
  const hash = toHex(await crypto.subtle.digest("SHA-256", bytes));
  return { bytes, hash };
}

/** Stores encoded rows as a new asset (outside undo) and returns the snapshot that points at it. */
export function addSnapshot(
  doc: CanvasDocument,
  rows: DataRow[],
  { bytes, hash }: EncodedRows,
): DataSnapshot {
  const assetId = createId();
  doc.addAsset(assetId, bytes);
  cache.set(assetId, rows);
  return { assetId, updatedAt: Date.now(), rowCount: rows.length, hash };
}

/** Saves rows as a new snapshot asset of the document. */
export async function writeSnapshot(doc: CanvasDocument, rows: DataRow[]): Promise<DataSnapshot> {
  return addSnapshot(doc, rows, await encodeRows(rows));
}

/** The rows a snapshot holds; none when there's no snapshot or its asset is missing or broken. */
export function readSnapshot(doc: CanvasDocument, snapshot: DataSnapshot | null): DataRow[] {
  if (!snapshot) return [];
  const cached = cache.get(snapshot.assetId);
  if (cached) return cached;
  const bytes = doc.getAsset(snapshot.assetId);
  if (!bytes) return [];
  let rows: DataRow[] = [];
  try {
    const file = JSON.parse(new TextDecoder().decode(bytes)) as Partial<SnapshotFile> | null;
    if (file && file.version === 1 && Array.isArray(file.rows)) rows = file.rows;
  } catch {
    rows = [];
  }
  cache.set(snapshot.assetId, rows);
  return rows;
}
