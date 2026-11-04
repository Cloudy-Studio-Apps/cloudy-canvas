/** How many of the pictures an Update saves are in. */
export interface UpdateProgress {
  done: number;
  total: number;
}

import type { ImageFailure } from "../update";

/** The pictures an Update couldn't save (with why), and how many were past the limit. */
export interface ImageFailures {
  failed: ImageFailure[];
  overLimit: number;
}
