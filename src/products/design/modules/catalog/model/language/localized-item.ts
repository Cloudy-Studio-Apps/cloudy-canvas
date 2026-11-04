import type { PageItemDefinition } from "../page-items/page-item-definition.types";
import { documentTexts } from "./document-texts";

/**
 * A page item as a brochure in language `code` writes it: a built-in's layer name, "Page 3
 * of 24" and "see page 12" in that language; any other item (a plugin's) as it is.
 */
export function localizedItem(item: PageItemDefinition, code: string): PageItemDefinition {
  const texts = documentTexts(code);
  const label = texts.items[item.id];
  if (label === undefined) return item;
  const template =
    item.id === "page-of" ? texts.pageOf : item.id === "page-ref" ? texts.pageRef : item.template;
  return { ...item, label, template };
}
