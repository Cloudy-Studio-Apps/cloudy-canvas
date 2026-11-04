/** A stretch of a resolved template that opens a page: characters `start` to `end`. */
export interface TemplateLink {
  start: number;
  end: number;
  /** The side it opens: its index in the layout's `sides`. */
  side: number;
}

/** A page item's text on one page, with the stretches that link to other pages. */
export interface TemplateParts {
  text: string;
  links: TemplateLink[];
}
