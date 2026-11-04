/** How many of the pictures an Update saves are in. */
export interface UpdateProgress {
  done: number;
  total: number;
}

/** The pictures an Update couldn't save: their values, and how many were past the limit. */
export interface ImageFailures {
  values: string[];
  overLimit: number;
}
