/** A stretch of a resolved template that opens a page: characters `start` to `end`. */
export interface TemplateLink {
  start: number;
  end: number;
  /** The side it opens: its index in the layout's `sides`. */
  side: number;
  /** A line of the contents (it links across its text's width) or a `{page:Name}`'s number. */
  kind: "contents" | "ref";
}

/** A page item's text on one page, with the stretches that link to other pages. */
export interface TemplateParts {
  text: string;
  links: TemplateLink[];
}
