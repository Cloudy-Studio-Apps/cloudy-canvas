import type { CanvasElement } from "../../elements";
import type { Rect } from "../../geometry.types";
import type { ExportHost } from "../export.types";
import type { PdfExportOptions } from "./pdf-options.types";

/** A page of a `PdfBook`: elements (with what moves with them) and exactly the world area shown. */
export interface PdfBookPage {
  ids: readonly string[];
  rect: Rect;
  /** Changes an element as this page draws it (a frame grown to the bleed). */
  prepare?: (element: CanvasElement) => CanvasElement;
  /** Areas of the page that open another page of the book (left out of PDF/X files). */
  links?: readonly PdfBookLink[];
}

/** A clickable area of a book's page, in world units of the area it shows. */
export interface PdfBookLink {
  rect: Rect;
  /** The page it opens: its 0-based index in the book (`add`/`addBlank` return it). */
  page: number;
}

/** A PDF written a page at a time, for exports that move between pages or report progress. */
export interface PdfBookOptions extends Partial<PdfExportOptions> {
  /** Reads the workspace as it is now, so a page can follow a scope change. */
  host: () => ExportHost;
}
