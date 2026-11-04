/**
 * The messages an Update fails with that the Data tab knows and translates (engine messages stay
 * English; `ui/data-tab/error-text.ts` maps these). Others are shown as they are.
 */
export const UPDATE_ERRORS = {
  /** Followed by the keys, e.g. `Missing: url, headers.Authorization`. */
  missing: "Missing: ",
  noFormat: "Couldn't tell the data's format.",
  pickFileAgain: "Pick the file again on this device.",
  privateFile: "This file is in the app's own data folder, which data sources can't read.",
  webPage: "The source answered a web page, not data.",
} as const;

/** The message of a link that answered an HTTP error (`<url> answered <status>.`). */
export function answeredMessage(url: string, status: number): string {
  return `${url} answered ${status}.`;
}

/** The url and status of an `answeredMessage`, or `null` for any other message. */
export function readAnsweredMessage(message: string): { url: string; status: string } | null {
  const match = /^(.+) answered (\d{3})\.$/.exec(message);
  return match ? { url: match[1] ?? "", status: match[2] ?? "" } : null;
}
