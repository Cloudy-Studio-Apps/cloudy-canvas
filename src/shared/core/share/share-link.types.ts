import type { RelaySettings } from "./share-transport.types";

/** What a session's link carries: where the host is, its relay, and the session's secret. */
export interface ShareTicket {
  /** The transport's address of the host (opaque JSON). */
  addr: unknown;
  /** The host's relay (`null`: the public ones), which guests use too. */
  relay: RelaySettings | null;
  /** Proves the guest got the link; checked before the host is asked. */
  secret: string;
}
