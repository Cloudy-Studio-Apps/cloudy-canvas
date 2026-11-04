import type { TemplateContext } from "./page-item.types";

const TOKENS = /\{\{|\{(page|pages|title|section|date|toc)\}/g;

/**
 * A page item's text on one page: `{page}` its number, `{pages}` how many, `{title}` the
 * brochure's name, `{section}` its section's, `{date}` today and `{toc}` the contents; `{{`
 * writes a brace, and anything else is kept as written.
 */
export function resolveTemplate(template: string, context: TemplateContext): string {
  return template.replace(TOKENS, (match, token: string | undefined) => {
    switch (token) {
      case "page":
        return context.info.label;
      case "pages":
        return String(context.pages);
      case "title":
        return context.title;
      case "section":
        return context.info.section?.name ?? "";
      case "date":
        return context.date;
      case "toc":
        return context.toc;
      default:
        return match === "{{" ? "{" : match;
    }
  });
}
