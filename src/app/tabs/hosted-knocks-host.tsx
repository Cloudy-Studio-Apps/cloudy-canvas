import { lazy, Suspense, useSyncExternalStore } from "react";

import { sharingState } from "@canvas-ui/share/sharing-state";
import { useFileTabs } from "@canvas-ui/tabs";

/** The knock cards, loaded with the sharing code (the shell never imports it). */
const HostedKnocks = lazy(() =>
  import("@canvas-ui/share/share-dialog/hosted-knocks").then((share) => ({
    default: share.HostedKnocks,
  })),
);

/**
 * The people knocking on the file this app shares, over whatever tab is on screen (desktop): the
 * hosted file's editor may be in the background or gone while its session goes on. The cards name
 * the file.
 */
export function HostedKnocksHost() {
  const fileId = useSyncExternalStore(sharingState.subscribe, sharingState.fileId);
  const name = useFileTabs((snapshot) =>
    fileId ? (snapshot.tabs.find((tab) => tab.fileId === fileId)?.name ?? "") : "",
  );
  if (!fileId) return null;
  return (
    <Suspense fallback={null}>
      <HostedKnocks fileId={fileId} fileName={name} />
    </Suspense>
  );
}
