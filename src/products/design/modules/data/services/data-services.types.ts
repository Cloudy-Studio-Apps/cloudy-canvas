import type { HttpClient, SecretStore } from "@shared/core";

/** What the engine reaches on the platform; the app provides it. */
export interface DataServices {
  http: Pick<HttpClient, "request" | "getBytes">;
  readFile(path: string): Promise<Uint8Array>;
  pickFile(
    extensions: string[],
  ): Promise<{ path: string | null; name: string; bytes: Uint8Array } | null>;
  /** Asks for a folder on this device; its path, `null` when cancelled. */
  pickFolder(): Promise<string | null>;
  secrets: SecretStore;
  /** Whether a path is inside the app's own data folder (where secrets are kept): never read. */
  isPrivatePath(path: string): Promise<boolean>;
}

/** Data as a source type fetched it, before a format parses it. */
export interface RawData {
  /** The rows are already found and placed at the source's `rowsPath` (a link that pages). */
  rowsPlaced?: boolean;
  text?: string;
  bytes?: Uint8Array;
  mime?: string;
  fileName?: string;
}

/** What a source type's `update` gets. */
export interface SourceContext {
  services: DataServices;
  signal: AbortSignal;
  secrets: Record<string, string>;
  /**
   * This device's paths of the source's chosen files and folders, by setting key (the file keeps
   * names only).
   */
  files: Record<string, string>;
  /** The source's "Rows come from" path (`null`: the first list found), for a type that pages. */
  rowsPath: string | null;
  /** Try it is asking: a type that would fetch many pieces needs only the first. */
  preview: boolean;
  /** Tells the user something about this fetch (shown on the source, or in Try it). */
  warn(message: string): void;
}
