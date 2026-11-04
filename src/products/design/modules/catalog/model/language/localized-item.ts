import type { PageItemDefinition } from "../page-items/page-item-definition.types";
import { documentTexts } from "./document-texts";

/**
 * A page item as a brochure in language `code` writes it: a built-in's layer name and "Page 3
 * of 24" in that language; any other item (a plugin's) as it is.
 */
export function localizedItem(item: PageItemDefinition, code: string): PageItemDefinition {
  const texts = documentTexts(code);
  const label = texts.items[item.id];
  if (label === undefined) return item;
  return { ...item, label, ...(item.id === "page-of" ? { template: texts.pageOf } : {}) };
}
