import type { HttpClient, SecretStore } from "@shared/core";

/** What the engine reaches on the platform; the app provides it. */
export interface DataServices {
  http: Pick<HttpClient, "request" | "getBytes">;
  readFile(path: string): Promise<Uint8Array>;
  pickFile(
    extensions: string[],
  ): Promise<{ path: string | null; name: string; bytes: Uint8Array } | null>;
  secrets: SecretStore;
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
}
