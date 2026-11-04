import type { HttpClient, SecretStore } from "@shared/core";

/** What the engine reaches on the platform; the app provides it. */
export interface DataServices {
  http: Pick<HttpClient, "request" | "getBytes">;
  readFile(path: string): Promise<Uint8Array>;
  pickFile(
    extensions: string[],
  ): Promise<{ path: string | null; name: string; bytes: Uint8Array } | null>;
  secrets: SecretStore;
  /** Whether a path is inside the app's own data folder (where secrets are kept): never read. */
  isPrivatePath(path: string): Promise<boolean>;
}

/** Data as a source type fetched it, before a format parses it. */
export interface RawData {
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
  /** This device's paths of the source's chosen files, by setting key (the file keeps names only). */
  files: Record<string, string>;
}
