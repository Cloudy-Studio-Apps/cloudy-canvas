import type { FileTab } from "@canvas";
import { FILE_FORMATS } from "../../tabs/file-formats";

/**
 * The name agents see for a tab, the one its button shows (`tab.name`: the title, else the file
 * name) and, before its editor reported one, the document's title, else the product's untitled
 * name.
 */
export async function tabDisplayName(tab: FileTab): Promise<string> {
  if (tab.name) return tab.name;
  const title = tab.load.status === "ready" ? tab.load.document.meta().title : "";
  return title || (await FILE_FORMATS[tab.type]()).untitled;
}
