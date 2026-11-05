/** A source an export was asked to update first that couldn't be: nothing is exported. */
export class SourceUpdateError extends Error {
  constructor(
    /** The source's name. */
    readonly source: string,
    /** Why, as the Update said (`UPDATE_ERRORS` and the like, English). */
    readonly reason: string,
  ) {
    super(`${source} couldn't be updated: ${reason}`);
    this.name = "SourceUpdateError";
  }
}
