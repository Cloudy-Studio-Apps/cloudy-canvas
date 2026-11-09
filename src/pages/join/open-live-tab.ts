import type { FileTabs, ShareGuest } from "@canvas";
import { handOverGuest } from "@canvas-ui";
import { toastSessionEnd } from "./toast-session-end";

/**
 * Shows a joined session in a file tab of `fileTabs` (the app's, `useFileTabsModel()`), which owns the guest from now on: closing the tab leaves
 * the session, and a session that ends closes its tab, saying why. When the session is already
 * open in a tab, that one is shown and this second guest leaves. `false` while the file hasn't
 * arrived.
 */
export function openLiveTab(fileTabs: FileTabs, guest: ShareGuest): boolean {
  const file = guest.state.get().file;
  if (!file) return false;
  handOverGuest(guest);
  const existing = fileTabs.byFileId(`live:${file.fileId}`);
  if (existing) {
    if (existing.live !== guest) guest.leave();
    fileTabs.activate(existing.id);
    return true;
  }
  const tab = fileTabs.open(
    { type: file.product, fileId: file.fileId, live: guest, name: file.fileName },
    { activate: true },
  );
  const stop = guest.state.subscribe(() => {
    const { status, end } = guest.state.get();
    if (status !== "closed") return;
    stop();
    if (end) toastSessionEnd(end);
    fileTabs.close(tab.id);
  });
  return true;
}
