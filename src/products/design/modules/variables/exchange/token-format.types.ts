import type { TokenReadResult, TokenStore } from "@canvas";

/**
 * A file format tokens are read from or written to (DTCG JSON, CSS…). Modules contribute them to
 * `tokenFormats`; the Variables window's Import/Export and the agents' tools list them.
 */
export interface TokenFormat {
  id: string;
  /** "W3C Design Tokens (JSON)". */
  label: string;
  /** Without the dot. */
  extension: string;
  /** The save dialog's file type name. */
  fileLabel: string;
  /** The file's text; `title` names the design. */
  write?(store: TokenStore, title: string): string;
  read?(text: string): TokenReadResult;
  /** Whether parsed JSON is in this format (tried in contribution order). */
  detect?(json: unknown): boolean;
}

/** What a picked file held, ready to import. */
export interface TokenSourceRead extends TokenReadResult {
  /** The format it was read as ("Cloudy Canvas design", "Tokens Studio"…). */
  label: string;
}
