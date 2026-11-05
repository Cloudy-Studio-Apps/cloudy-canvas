import type { DataRow } from "../table";

/**
 * What a snapshot asset holds, versioned so the format can change later: the rows (version 1),
 * and for a source with a shape step also the rows as read before it (`raw`, version 2), so the
 * step can change without fetching again.
 */
export type SnapshotFile =
  | { version: 1; rows: readonly DataRow[] }
  | { version: 2; raw: readonly DataRow[]; rows: readonly DataRow[] };

/** Rows encoded for a snapshot asset, with the hash of those bytes. */
export interface EncodedRows {
  bytes: Uint8Array;
  hash: string;
}

/** A snapshot's rows (frozen: read-only) and the rows as read before the shape step (`raw`). */
export interface SnapshotRows {
  rows: readonly DataRow[];
  /** The same array as `rows` when the snapshot keeps no unshaped rows (version 1). */
  raw: readonly DataRow[];
}
