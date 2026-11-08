import type { LibraryAsset, LibraryEdit } from "@canvas";
import type { LibraryHub } from "./library-hub";

/** What `LibraryHub.addAssetFile` needs to know about a picture besides its bytes. */
export type LibraryAssetInput = Omit<LibraryAsset, "id" | "hash" | "kind" | "order">;

/** Edits to write to a project's libraries, by library id (`libraryEditsOf`). */
export type LibraryEdits = ReadonlyMap<string, LibraryEdit>;

/**
 * Told which libraries changed (their ids), from any editor or the project home, and who applied
 * the change (`apply`'s `from`; `null` for anything else).
 */
export type LibraryHubListener = (libraryIds: ReadonlySet<string>, from: unknown) => void;

/** One opener's hold on a project's hub: `release` lets go (a second call does nothing). */
export interface OpenedHub {
  hub: LibraryHub;
  release: () => Promise<void>;
}

/** How many openers hold a hub (shared by the cache entry and the hub). */
export interface HubCount {
  refs: number;
}

/** A hub in the open hubs' cache: the hub (loading or loaded) and its openers. */
export interface HeldHub<H> {
  hub: Promise<H>;
  count: HubCount;
}
