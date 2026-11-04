import type { BrochureElement } from "../../brochure";
import type { BookLayout } from "../book-layout.types";
import { brochureLanguage } from "../language/document-texts";
import type { PageInfo } from "../numbering/page-numbers.types";
import { contentsEntries } from "./contents-entries";
import type { TemplateContext } from "./page-item.types";
import { pageRefs } from "./page-refs";

/**
 * What a brochure's page items read but a page's own (`info`), the same for stamping them and
 * for the PDF's links: how many pages count, its name, today in its language, its contents and
 * what `{page:Name}` finds.
 */
export function brochureContext(
  record: BrochureElement,
  layout: BookLayout,
  numbers: readonly PageInfo[],
): Omit<TemplateContext, "info"> {
  return {
    pages: numbers.filter((info) => info.counted).length,
    title: record.name,
    date: new Intl.DateTimeFormat(brochureLanguage(record.settings), {
      dateStyle: "long",
    }).format(new Date()),
    contents: contentsEntries(layout, numbers),
    refs: pageRefs(layout, numbers),
  };
}
