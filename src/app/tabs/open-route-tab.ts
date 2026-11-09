import { fileTabs } from "./file-tabs-instance";
import type { FileRoute } from "./tab-route.types";

/**
 * Shows what a route asks for: a file route opens its tab (a new file when the id isn't in
 * storage), and an open file linked to again with params (`?mode=`) takes them, as its editor did;
 * any other route shows Home. Returns `false` for a joined session's route whose tab is gone (it
 * can't come back from its route), which goes Home instead.
 */
export function openRouteTab(file: FileRoute | null, params: Record<string, string>): boolean {
  if (!file) {
    fileTabs.activate(null);
    return true;
  }
  const existing = fileTabs.byFileId(file.id);
  if (!existing && file.id.startsWith("live:")) return false;
  const tab = fileTabs.open({ type: file.type, fileId: file.id, params });
  if (existing && Object.keys(params).length > 0) {
    fileTabs.patch(tab.id, { params: { ...existing.params, ...params } });
  }
  return true;
}
