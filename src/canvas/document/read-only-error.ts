/**
 * What a collaborator's edit throws on a read-only document (a live session's viewer), so an
 * agent hears why nothing changed instead of a success that did nothing.
 */
export class ReadOnlyDocumentError extends Error {
  constructor() {
    super("This file is shared with you to view only: it can't be edited.");
    this.name = "ReadOnlyDocumentError";
  }
}
