import type { ElementPatch } from "@canvas";

import type { TextNodeElement, TextTemplateSource } from "../../../text";
import { pageItemTag, pageItemTemplate } from "./page-item-fields";

/**
 * A page item's text is edited as its template ("Page {page} of {pages}"): the edit writes only
 * `catalogText`, and the sync then writes what it reads on its page. A master's copies aren't
 * claimed: they're edited through their master. Styles set while editing aren't kept, as the
 * sync drops a page item's styled ranges.
 */
export const CATALOG_TEXT_TEMPLATE: TextTemplateSource = {
  id: "catalog.page-item",
  claims: (el) => pageItemTemplate(el) !== null && pageItemTag(el) === null,
  read: (el) => ({ text: pageItemTemplate(el) ?? el.text, runs: [] }),
  write: (_el, text) => ({ catalogText: text }) as unknown as ElementPatch<TextNodeElement>,
};
