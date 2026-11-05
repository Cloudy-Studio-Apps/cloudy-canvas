import type { CanvasDocument } from "@canvas";
import { createId } from "@shared/core";

import type { DataSnapshot } from "../source";
import type { DataRow } from "../table";
import type { EncodedRows, SnapshotFile } from "./snapshot.types";
import { heldSnapshots } from "./held-snapshots";

/**
 * Parsed rows by Yjs doc, then asset id: an asset never changes, so each is parsed once (`null`:
 * broken). The rows are frozen (the array and each row), since every reader shares them.
 */
const caches = new WeakMap<CanvasDocument["doc"], Map<string, readonly DataRow[] | null>>();

function cacheOf(doc: CanvasDocument): Map<string, readonly DataRow[] | null> {
  let cache = caches.get(doc.doc);
  if (!cache) {
    cache = new Map();
    caches.set(doc.doc, cache);
  }
  return cache;
}

function freezeRows(rows: DataRow[]): readonly DataRow[] {
  for (const row of rows) Object.freeze(row);
  return Object.freeze(rows);
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Rows as a snapshot asset's bytes (`{ version: 1, rows }` in UTF-8) and their SHA-256 (hex). */
export async function encodeRows(rows: readonly DataRow[]): Promise<EncodedRows> {
  const file: SnapshotFile = { version: 1, rows };
  const bytes = new TextEncoder().encode(JSON.stringify(file));
  const hash = toHex(await crypto.subtle.digest("SHA-256", bytes));
  return { bytes, hash };
}

/** Stores encoded rows as a new asset (outside undo) and returns the snapshot that points at it. */
export function addSnapshot(
  doc: CanvasDocument,
  rows: readonly DataRow[],
  { bytes, hash }: EncodedRows,
): DataSnapshot {
  const assetId = createId();
  // Held before it's added, so the snapshot it replaces is held too (undo may bring it back).
  heldSnapshots(doc).add(assetId);
  doc.addAsset(assetId, bytes);
  cacheOf(doc).set(assetId, freezeRows(rows.map((row) => ({ ...row }))));
  return { assetId, updatedAt: Date.now(), rowCount: rows.length, hash };
}

/** Saves rows as a new snapshot asset of the document. */
export async function writeSnapshot(
  doc: CanvasDocument,
  rows: readonly DataRow[],
): Promise<DataSnapshot> {
  return addSnapshot(doc, rows, await encodeRows(rows));
}

/**
 * The rows a snapshot holds (frozen: read-only): none when there's no snapshot yet, `null` when
 * its asset can't be read (missing on this device, as in a live session before it arrives, or
 * broken). A missing asset isn't remembered, so it reads once it arrives.
 */
export function readSnapshot(
  doc: CanvasDocument,
  snapshot: DataSnapshot | null,
): readonly DataRow[] | null {
  if (!snapshot) return [];
  const cache = cacheOf(doc);
  if (cache.has(snapshot.assetId)) return cache.get(snapshot.assetId) ?? null;
  const bytes = doc.getAsset(snapshot.assetId);
  if (!bytes) return null;
  let rows: readonly DataRow[] | null = null;
  try {
    const file = JSON.parse(new TextDecoder().decode(bytes)) as Partial<SnapshotFile> | null;
    if (file && file.version === 1 && Array.isArray(file.rows))
      rows = freezeRows(file.rows as DataRow[]);
  } catch {
    rows = null;
  }
  cache.set(snapshot.assetId, rows);
  return rows;
}
