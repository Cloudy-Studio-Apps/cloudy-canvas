import type { LibraryAsset, LibraryEdit } from "@canvas";

/** What `LibraryHub.addAssetFile` needs to know about a picture besides its bytes. */
export type LibraryAssetInput = Omit<LibraryAsset, "id" | "hash" | "kind" | "order">;

/** Edits to write to a project's libraries, by library id (`libraryEditsOf`). */
export type LibraryEdits = ReadonlyMap<string, LibraryEdit>;

/** Told which libraries changed (their ids), from any editor or the project home. */
export type LibraryHubListener = (libraryIds: ReadonlySet<string>) => void;

/** How many openers hold a hub (shared by the cache entry and the hub). */
export interface HubCount {
  refs: number;
}

/** A hub in the open hubs' cache: the hub (loading or loaded) and its openers. */
export interface HeldHub<H> {
  hub: Promise<H>;
  count: HubCount;
}
