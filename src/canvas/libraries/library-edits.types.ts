import type { TokenRecord } from "../tokens/token.types";

/** What a file wrote to one library's records: records to store (untagged) and ids removed. */
export interface LibraryEdit {
  put: TokenRecord[];
  removed: string[];
}
