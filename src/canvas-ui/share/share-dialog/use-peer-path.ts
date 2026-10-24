import { useEffect, useState } from "react";

import type { ShareHost } from "@canvas";
import type { PeerPath } from "@shared/core";

/** How often a guest's connection type is asked again (hole punching can succeed later). */
const POLL_MS = 3_000;

/** Whether a guest is reached directly or through the relay, kept up to date. */
export function usePeerPath(host: ShareHost, peer: number): PeerPath | null {
  const [path, setPath] = useState<PeerPath | null>(null);
  useEffect(() => {
    let active = true;
    const read = () =>
      void host.peerPath(peer).then(
        (next) => active && setPath(next),
        () => {},
      );
    read();
    const timer = setInterval(read, POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [host, peer]);
  return path;
}
