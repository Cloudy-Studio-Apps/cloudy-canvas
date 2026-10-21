import type { CustomSticker } from "@shared/core";

/** What an edit of the library index writes, and what it returns. */
export interface LibraryEdit<T> {
  stickers: CustomSticker[];
  result: T;
}
