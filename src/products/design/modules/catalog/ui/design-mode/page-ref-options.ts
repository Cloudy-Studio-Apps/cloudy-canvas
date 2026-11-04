import type { SelectOption } from "@shared/ui/kit";
import type { BookLayout } from "../../model/book-layout.types";
import type { PageInfo } from "../../model/numbering";
import { canReferTo } from "../../model/page-items/page-ref-token";

/** Before a subsection's name, once per level it's down. */
const INDENT = " ";

/**
 * What a page reference can point to: the brochure's sections in reading order (subsections
 * indented), then its pages by frame name, each with its number; a name used twice once.
 */
export function pageRefOptions(
  layout: BookLayout,
  numbers: readonly PageInfo[],
): SelectOption<string>[] {
  const sections: SelectOption<string>[] = [];
  const pages: SelectOption<string>[] = [];
  const seen = new Set<string>();
  const offer = (list: SelectOption<string>[], name: string, label: string, depth = 0) => {
    const key = name.trim().toLocaleLowerCase();
    if (!canReferTo(name) || seen.has(key)) return;
    seen.add(key);
    const number = label ? ` · ${label}` : "";
    list.push({ value: name, label: `${INDENT.repeat(depth)}${name}${number}` });
  };
  layout.sides.forEach((side, i) => {
    const info = numbers[i];
    if (!info || side.kind !== "page" || side.part === "right") return;
    info.path.forEach((section, depth) => offer(sections, section.name, info.label, depth));
  });
  layout.sides.forEach((side, i) => {
    const info = numbers[i];
    if (!info || side.kind !== "page" || side.part === "right") return;
    offer(pages, side.page.frame.name, info.label);
  });
  return [...sections, ...pages];
}
