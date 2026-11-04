import type { TemplateContext } from "./page-item.types";
import type { TemplateLink, TemplateParts } from "./template-parts.types";
import { sectionLabel } from "../sections/section-label";
import { readSectionParents } from "../sections/section-token";
import { contentsLine } from "./table-of-contents";

/** What a `{page:Name}` that names nothing writes. */
export const UNMATCHED_PAGE_REF = "??";

const TOKENS = /\{\{|\{page:([^}]*)\}|\{(page|pages|title|section|date|toc)(?::(all|\d+))?\}/g;

/**
 * A page item's text on one page: `{page}` its number, `{pages}` how many, `{title}` the
 * brochure's name, `{section}` its section's (`{section:2}` with the two sections it's in before
 * it, `{section:all}` with all of them: "Túneles › Shotcrete"), `{date}` today, `{toc}` the
 * contents and `{page:Name}` the number of the section or page called `Name` (`??` when there's
 * none); `{{` writes a brace, and anything else is kept as written. Each line of the contents and
 * each `{page:Name}` that wrote a number is a link to its page.
 */
export function templateParts(template: string, context: TemplateContext): TemplateParts {
  const links: TemplateLink[] = [];
  let text = "";
  let last = 0;
  for (const match of template.matchAll(TOKENS)) {
    const [whole, refName, token, option] = match;
    text += template.slice(last, match.index);
    last = match.index + whole.length;
    if (whole === "{{") {
      text += "{";
    } else if (refName !== undefined) {
      const target = context.refs(refName);
      const label = target ? target.label : UNMATCHED_PAGE_REF;
      if (target && label)
        links.push({ start: text.length, end: text.length + label.length, side: target.side });
      text += label;
    } else if (option !== undefined && token !== "section") {
      text += whole;
    } else if (token === "toc") {
      context.contents.forEach((entry, i) => {
        if (i > 0) text += "\n";
        const line = contentsLine(entry);
        links.push({ start: text.length, end: text.length + line.length, side: entry.side });
        text += line;
      });
    } else {
      text += valueOf(token, option, context);
    }
  }
  return { text: text + template.slice(last), links };
}

function valueOf(token: string | undefined, option: string | undefined, context: TemplateContext) {
  switch (token) {
    case "page":
      return context.info.label;
    case "pages":
      return String(context.pages);
    case "title":
      return context.title;
    case "section":
      return sectionLabel(context.info.path, readSectionParents(option));
    case "date":
      return context.date;
    default:
      return "";
  }
}
