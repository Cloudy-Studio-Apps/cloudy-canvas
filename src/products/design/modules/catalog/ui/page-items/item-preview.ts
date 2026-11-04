import { getLocale } from "@shared/core";

import type { BrochureView } from "../hooks/use-brochure.types";
import type { PageItemTarget } from "../../model/page-items/page-item-definition.types";
import { resolveTemplate } from "../../model/page-items/resolve-template";

/**
 * What a page item's template reads on `target` (a master side: its first page), on one line;
 * the template itself when there's no page to read it on, and `null` for the contents.
 */
export function itemPreview(
  template: string,
  target: PageItemTarget | undefined,
  view: BrochureView,
): string | null {
  if (template.includes("{toc}")) return null;
  const { layout, numbers, masters, brochure } = view;
  const isMaster = masters.some(
    (item) => item.left === target?.frame.id || item.right === target?.frame.id,
  );
  const index = isMaster
    ? numbers.findIndex((info) => info.label && info.parity === target?.side)
    : layout.sides.findIndex(
        (side, i) =>
          side.kind === "page" &&
          side.page.options.some((option) => option.id === target?.frame.id) &&
          numbers[i]?.parity === target?.side,
      );
  const info = numbers[index];
  if (!info) return template;
  return resolveTemplate(template, {
    info,
    pages: numbers.filter((item) => item.counted).length,
    title: brochure?.name ?? "",
    date: new Intl.DateTimeFormat(getLocale(), { dateStyle: "long" }).format(new Date()),
    toc: "",
  }).replace(/\s+/g, " ");
}
