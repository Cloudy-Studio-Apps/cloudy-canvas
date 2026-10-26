import type { CanvasDocument, StyleRecord, TokenStore, VariableRecord } from "@canvas";

import type { SheetBuildContext } from "../styleguide.types";

/** The local date, `YYYY-MM-DD`. */
function today(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** What templates build with, but the modes: the tokens, the file's title, the date, names. */
export function sheetContext(
  doc: CanvasDocument,
  store: TokenStore,
): Omit<SheetBuildContext, "modes" | "resolve"> {
  return {
    store,
    meta: doc.meta(),
    today: today(),
    pathOf: (record: VariableRecord | StyleRecord) => {
      if (record.kind === "style") return record.name;
      const collection = store.collection(record.collectionId);
      return collection ? `${collection.name}/${record.name}` : record.name;
    },
  };
}
