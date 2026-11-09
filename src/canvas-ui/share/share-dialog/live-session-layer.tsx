import { tabsSupported } from "@platform";
import { useCanvasFile } from "../../file";
import { useHostedSession } from "../host-session";
import { ShareKnocks } from "./share-knocks";

/**
 * What a shared file's editor always shows, even with its panels or UI hidden: who's knocking.
 * Only where there are no tabs (Android): on desktop the app shows the knocks once for every tab
 * (`HostedKnocks`), since the hosted file's editor may be in the background or gone.
 */
export function LiveSessionLayer() {
  const file = useCanvasFile();
  const host = useHostedSession(file.id);
  return host && !tabsSupported() ? <ShareKnocks host={host} /> : null;
}
