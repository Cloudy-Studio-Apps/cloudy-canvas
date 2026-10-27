export interface DescribedError {
  /** One line: the error's message, or a route response's status. */
  message: string;
  /** The stack's frames, the page's origin left out, oldest last. Empty when there's none. */
  frames: string[];
}
