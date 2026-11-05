/**
 * A brochure export with the saved data, refused: a source it reads has no data on this device, so
 * its pages would print incomplete. Updating the source first fixes it.
 */
export class MissingDataError extends Error {
  constructor(
    /** The source's name. */
    readonly source: string,
  ) {
    super(`${source}'s data isn't on this device yet; update it first.`);
    this.name = "MissingDataError";
  }
}
