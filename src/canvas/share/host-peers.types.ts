import type { ShareIdentity, ShareRole } from "@shared/core";

/**
 * A connection to the host: waiting for its hello, knocking (the host decides), let in, or told to
 * go (`leaving`, until it closes).
 */
export interface HostPeer {
  peer: number;
  stage: "hello" | "knocking" | "admitted" | "leaving";
  identity: ShareIdentity;
  appVersion: string;
  role: ShareRole;
  /** The key it was let in with, to come back after a dropped connection. */
  rejoin: string | null;
  /** The transaction and awareness origin of what it sends. */
  origin: { peer: number };
  /** Its Yjs awareness client ids. */
  clients: Set<number>;
  timer: ReturnType<typeof setTimeout> | null;
}
