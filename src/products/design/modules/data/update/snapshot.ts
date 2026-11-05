import type { CanvasDocument } from "@canvas";
import { createId } from "@shared/core";

import type { DataSnapshot } from "../source";
import type { DataRow } from "../table";
import type { EncodedRows, SnapshotFile, SnapshotRows } from "./snapshot.types";
import { heldSnapshots } from "./held-snapshots";

/**
 * Parsed rows by Yjs doc, then asset id: an asset never changes, so each is parsed once (`null`:
 * broken). The rows are frozen (the array and each row), since every reader shares them.
 */
const caches = new WeakMap<CanvasDocument["doc"], Map<string, SnapshotRows | null>>();

function cacheOf(doc: CanvasDocument): Map<string, SnapshotRows | null> {
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

/**
 * Rows as a snapshot asset's bytes and their SHA-256 (hex): `{ version: 1, rows }` in UTF-8, or
 * with `raw` (the rows before a shape step) `{ version: 2, raw, rows }`.
 */
export async function encodeRows(
  rows: readonly DataRow[],
  raw?: readonly DataRow[],
): Promise<EncodedRows> {
  const file: SnapshotFile = raw ? { version: 2, raw, rows } : { version: 1, rows };
  const bytes = new TextEncoder().encode(JSON.stringify(file));
  const hash = toHex(await crypto.subtle.digest("SHA-256", bytes));
  return { bytes, hash };
}

/**
 * Stores encoded rows as a new asset (outside undo) and returns the snapshot that points at it;
 * `raw` when they were encoded with it.
 */
export function addSnapshot(
  doc: CanvasDocument,
  rows: readonly DataRow[],
  { bytes, hash }: EncodedRows,
  raw?: readonly DataRow[],
): DataSnapshot {
  const assetId = createId();
  // Held before it's added, so the snapshot it replaces is held too (undo may bring it back).
  heldSnapshots(doc).add(assetId);
  doc.addAsset(assetId, bytes);
  const shown = freezeRows(rows.map((row) => ({ ...row })));
  cacheOf(doc).set(assetId, {
    rows: shown,
    raw: raw ? freezeRows(raw.map((row) => ({ ...row }))) : shown,
  });
  return { assetId, updatedAt: Date.now(), rowCount: rows.length, hash };
}

/** Saves rows as a new snapshot asset of the document. */
export async function writeSnapshot(
  doc: CanvasDocument,
  rows: readonly DataRow[],
): Promise<DataSnapshot> {
  return addSnapshot(doc, rows, await encodeRows(rows));
}

/** A snapshot asset's rows (version 1 or 2), `null` when it isn't one. */
function decodeSnapshot(bytes: Uint8Array): SnapshotRows | null {
  try {
    const file = JSON.parse(new TextDecoder().decode(bytes)) as {
      version?: unknown;
      rows?: unknown;
      raw?: unknown;
    } | null;
    if (!file || !Array.isArray(file.rows)) return null;
    const rows = freezeRows(file.rows as DataRow[]);
    if (file.version === 1) return { rows, raw: rows };
    if (file.version === 2 && Array.isArray(file.raw)) {
      return { rows, raw: freezeRows(file.raw as DataRow[]) };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * A snapshot's rows and the rows as read before its source's shape step (frozen: read-only):
 * none when there's no snapshot yet, `null` when its asset can't be read (missing on this device,
 * as in a live session before it arrives, or broken). A missing asset isn't remembered, so it
 * reads once it arrives.
 */
export function readSnapshotRows(
  doc: CanvasDocument,
  snapshot: DataSnapshot | null,
): SnapshotRows | null {
  if (!snapshot) return { rows: [], raw: [] };
  const cache = cacheOf(doc);
  if (cache.has(snapshot.assetId)) return cache.get(snapshot.assetId) ?? null;
  const bytes = doc.getAsset(snapshot.assetId);
  if (!bytes) return null;
  const read = decodeSnapshot(bytes);
  cache.set(snapshot.assetId, read);
  return read;
}

/** The rows a snapshot holds (`readSnapshotRows`' `rows`), `null` when they can't be read. */
export function readSnapshot(
  doc: CanvasDocument,
  snapshot: DataSnapshot | null,
): readonly DataRow[] | null {
  return readSnapshotRows(doc, snapshot)?.rows ?? null;
}
