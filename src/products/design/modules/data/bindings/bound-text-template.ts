import type { ElementPatch } from "@canvas";

import type { TextNodeElement, TextTemplateSource } from "../../text";
import { dataFieldsOf } from "./binding-fields";
import { isCatalogText } from "./is-catalog-text";

/**
 * A text bound to data (`dataText`) is edited as its template, `{product.name}`, not as the text
 * it shows: the edit writes only `dataText`, and the data sync then writes the text it gives.
 * Texts a catalog fills are the catalog's (the sync skips them), so they aren't claimed.
 */
export const BOUND_TEXT_TEMPLATE: TextTemplateSource = {
  id: "data.bound-text",
  claims: (el) => dataFieldsOf(el).dataText !== undefined && !isCatalogText(el),
  read: (el) => {
    const template = dataFieldsOf(el).dataText;
    return template ? { text: template.text, runs: [...template.runs] } : { text: "", runs: [] };
  },
  write: (_el, text, runs) =>
    ({ dataText: { text, runs } }) as unknown as ElementPatch<TextNodeElement>,
};
