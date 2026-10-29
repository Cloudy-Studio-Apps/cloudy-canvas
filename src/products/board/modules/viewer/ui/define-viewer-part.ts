import type { ViewerPart } from "./viewer-part.types";

/**
 * A viewer part, typed by the data it collects, as `boardViewerParts` takes it (the point holds
 * parts of every kind of data; each panel only ever gets its own part's).
 */
export function defineViewerPart<D>(part: ViewerPart<D>): ViewerPart {
  return part as unknown as ViewerPart;
}
