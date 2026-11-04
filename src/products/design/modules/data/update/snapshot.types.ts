import type { DataRow } from "../table";

/** What a snapshot asset holds: the parsed rows, versioned so the format can change later. */
export interface SnapshotFile {
  version: 1;
  rows: DataRow[];
}

/** Rows encoded for a snapshot asset, with the hash of those bytes. */
export interface EncodedRows {
  bytes: Uint8Array;
  hash: string;
}
