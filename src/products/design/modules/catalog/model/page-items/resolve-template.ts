import type { TemplateContext } from "./page-item.types";
import { templateParts } from "./template-parts";

/** A page item's text on one page (see `templateParts` for its tokens). */
export function resolveTemplate(template: string, context: TemplateContext): string {
  return templateParts(template, context).text;
}
