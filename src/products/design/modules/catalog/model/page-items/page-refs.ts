import type { BookLayout } from "../book-layout.types";
import type { PageInfo } from "../numbering/page-numbers.types";
import type { PageRefs, PageRefTarget } from "./page-refs.types";

const keyOf = (name: string) => name.trim().toLocaleLowerCase();

/**
 * What `{page:Name}` reads in a brochure: the first page of the section called `Name`, else of
 * the page whose frame is; trimmed and in any case, the first in reading order.
 */
export function pageRefs(layout: BookLayout, numbers: readonly PageInfo[]): PageRefs {
  const sections = new Map<string, PageRefTarget>();
  const pages = new Map<string, PageRefTarget>();
  layout.sides.forEach((side, i) => {
    const info = numbers[i];
    if (!info || side.kind !== "page") return;
    const target = { label: info.label, side: i };
    for (const section of info.path) {
      const key = keyOf(section.name);
      if (!sections.has(key)) sections.set(key, target);
    }
    const key = keyOf(side.page.frame.name);
    if (!pages.has(key)) pages.set(key, target);
  });
  return (name) => {
    const key = keyOf(name);
    if (!key) return null;
    return sections.get(key) ?? pages.get(key) ?? null;
  };
}
