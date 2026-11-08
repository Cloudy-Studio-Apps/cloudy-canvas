import * as Y from "yjs";

import { isLibraryAsset } from "../document";
import { isTokenRecord } from "../tokens/is-token-record";
import type { TokenRecord } from "../tokens/token.types";
import { decodeLibraryFile, encodeLibraryFile } from "./library-file";
import type { LibraryAsset } from "./library-asset.types";
import type { LibraryChange } from "./library-document.types";

/** Origin of the edits `LibraryDocument` makes (a library has no undo history). */
const LIBRARY_ORIGIN = Symbol("library");

/**
 * A library's content, backed by a Yjs doc like a canvas file: its token records (variables,
 * collections, axes, styles) in `"tokens"`, its assets' metadata in `"assets"` and its id and
 * name in `"meta"`. Token records are stored without a `libraryId`: files get the tag when they
 * mirror the library. Asset bytes aren't in the document, they're files next to the library.
 */
export class LibraryDocument {
  /** The Yjs doc, for later live projects to sync. */
  readonly ydoc: Y.Doc;
  private readonly tokensMap: Y.Map<unknown>;
  private readonly assetsMap: Y.Map<unknown>;
  private readonly metaMap: Y.Map<string>;

  /** A new, empty library. */
  static create(id: string, name: string): LibraryDocument {
    const library = new LibraryDocument(new Y.Doc());
    library.ydoc.transact(() => {
      library.metaMap.set("id", id);
      library.metaMap.set("name", name);
    }, LIBRARY_ORIGIN);
    return library;
  }

  /** A library restored from `encodeFile()` output. Throws for other files. */
  static fromFile(bytes: Uint8Array): LibraryDocument {
    const doc = new Y.Doc();
    Y.applyUpdate(doc, decodeLibraryFile(bytes));
    return new LibraryDocument(doc);
  }

  private constructor(ydoc: Y.Doc) {
    this.ydoc = ydoc;
    this.tokensMap = ydoc.getMap<unknown>("tokens");
    this.assetsMap = ydoc.getMap<unknown>("assets");
    this.metaMap = ydoc.getMap<string>("meta");
  }

  get id(): string {
    return this.metaMap.get("id") ?? "";
  }

  name(): string {
    return this.metaMap.get("name") ?? "";
  }

  rename(name: string): void {
    this.ydoc.transact(() => this.metaMap.set("name", name), LIBRARY_ORIGIN);
  }

  /** The `.clib` file's bytes. */
  encodeFile(): Uint8Array {
    return encodeLibraryFile(Y.encodeStateAsUpdate(this.ydoc));
  }

  // ── Tokens ──────────────────────────────────────────────────────────

  /** Every token record (those this version doesn't understand are skipped). */
  tokenRecords(): TokenRecord[] {
    const records: TokenRecord[] = [];
    this.tokensMap.forEach((value) => {
      if (isTokenRecord(value)) records.push(value);
    });
    return records;
  }

  /** Stores records, replacing those with the same ids; a `libraryId` they carry is dropped. */
  setTokenRecords(records: readonly TokenRecord[]): void {
    this.ydoc.transact(() => {
      for (const record of records) {
        const stored: TokenRecord & { libraryId?: string } = { ...record };
        delete stored.libraryId;
        this.tokensMap.set(record.id, stored);
      }
    }, LIBRARY_ORIGIN);
  }

  removeTokenRecords(ids: Iterable<string>): void {
    this.ydoc.transact(() => {
      for (const id of ids) this.tokensMap.delete(id);
    }, LIBRARY_ORIGIN);
  }

  // ── Assets ──────────────────────────────────────────────────────────

  /** The assets' metadata in their order. */
  assets(): LibraryAsset[] {
    const list: LibraryAsset[] = [];
    this.assetsMap.forEach((value) => {
      if (isLibraryAsset(value)) list.push(value);
    });
    return list.sort((a, b) => (a.order < b.order ? -1 : a.order > b.order ? 1 : 0));
  }

  putAsset(asset: LibraryAsset): void {
    this.ydoc.transact(() => this.assetsMap.set(asset.id, { ...asset }), LIBRARY_ORIGIN);
  }

  removeAsset(id: string): void {
    this.ydoc.transact(() => this.assetsMap.delete(id), LIBRARY_ORIGIN);
  }

  // ── Changes ─────────────────────────────────────────────────────────

  /** Fires after each edit (local or remote) with the ids it changed. */
  observe(listener: (change: LibraryChange) => void): () => void {
    const handler = (transaction: Y.Transaction) => {
      let tokens: Set<string | null> | undefined;
      let assets: Set<string | null> | undefined;
      for (const [type, keys] of transaction.changed) {
        const map: unknown = type;
        if (map === this.tokensMap) tokens = keys;
        else if (map === this.assetsMap) assets = keys;
      }
      if (!tokens && !assets) return;
      const ids = (keys: Set<string | null> | undefined) =>
        new Set([...(keys ?? [])].filter((key): key is string => key !== null));
      listener({ tokens: ids(tokens), assets: ids(assets) });
    };
    this.ydoc.on("afterTransaction", handler);
    return () => this.ydoc.off("afterTransaction", handler);
  }
}
