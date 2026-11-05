/**
 * Thrown when a page a repeat made is to be detached or deleted while its rows can't be read on
 * this device (its list's data isn't here): what it shows can't be named, so nothing is written.
 */
export class UnreadableCopyError extends Error {
  constructor() {
    super("This page's data isn't on this device yet; update its source first.");
    this.name = "UnreadableCopyError";
  }
}
