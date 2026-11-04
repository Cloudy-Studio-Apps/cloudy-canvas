/** A language a brochure can be written in. */
export interface BrochureLanguage {
  /** Its BCP 47 tag ("es", "fr"). */
  code: string;
  /** Its name in itself ("Español", "Français"), as the language list shows it. */
  name: string;
}

/** The words a brochure writes in its pages and master frames, in one language. */
export interface DocumentTexts {
  /** The built-in page items' layer names, by item id. */
  items: Record<string, string>;
  /** The "Page 3 of 24" item's template. */
  pageOf: string;
  /** A master's frames' names after the master's: "A-Master · left". */
  left: string;
  right: string;
}
