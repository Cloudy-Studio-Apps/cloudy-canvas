import { useCanvasFile } from "../../file";
import { useHostedSession } from "../host-session";
import { ShareKnocks } from "./share-knocks";

/** What a shared file's editor always shows, even with its panels or UI hidden: who's knocking. */
export function LiveSessionLayer() {
  const file = useCanvasFile();
  const host = useHostedSession(file.id);
  return host ? <ShareKnocks host={host} /> : null;
}
