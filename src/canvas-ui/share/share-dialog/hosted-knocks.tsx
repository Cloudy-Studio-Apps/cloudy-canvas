import { useHostedSession } from "../host-session";
import type { HostedKnocksProps } from "./share-dialog.types";
import { ShareKnocks } from "./share-knocks";

/**
 * The knocks on the file this app shares, over whatever tab is on screen (desktop: the app mounts
 * it once, so a hosted file in the background, editor or not, still hears them). Each card names
 * the file.
 */
export function HostedKnocks({ fileId, fileName }: HostedKnocksProps) {
  const host = useHostedSession(fileId);
  return host ? <ShareKnocks host={host} fileName={fileName} /> : null;
}
