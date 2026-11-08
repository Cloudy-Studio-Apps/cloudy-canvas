import { isTokenRecord } from "../tokens/is-token-record";
import type { TokenRecord } from "../tokens/token.types";

/** The library a stored token record is mirrored from; `undefined` for the file's own (or not a record). */
export function libraryIdOf(value: unknown): string | undefined {
  return isTokenRecord(value) ? value.libraryId : undefined;
}

/** A library's record as a file stores it: tagged with the library's id. */
export function taggedRecord(record: TokenRecord, libraryId: string): TokenRecord {
  return { ...record, libraryId };
}

/** A file's record as its library stores it: without the tag. */
export function untaggedRecord(record: TokenRecord): TokenRecord {
  const copy = { ...record };
  delete copy.libraryId;
  return copy;
}
