import type { TemplateContext } from "./page-item.types";
import { sectionLabel } from "../sections/section-label";
import { readSectionParents } from "../sections/section-token";

const TOKENS = /\{\{|\{(page|pages|title|section|date|toc)(?::(all|\d+))?\}/g;

/**
 * A page item's text on one page: `{page}` its number, `{pages}` how many, `{title}` the
 * brochure's name, `{section}` its section's (`{section:2}` with the two sections it's in before
 * it, `{section:all}` with all of them: "Túneles › Shotcrete"), `{date}` today and `{toc}` the
 * contents; `{{` writes a brace, and anything else is kept as written.
 */
export function resolveTemplate(template: string, context: TemplateContext): string {
  return template.replace(
    TOKENS,
    (match, token: string | undefined, option: string | undefined) => {
      if (option !== undefined && token !== "section") return match;
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
        case "toc":
          return context.toc;
        default:
          return match === "{{" ? "{" : match;
      }
    },
  );
}
