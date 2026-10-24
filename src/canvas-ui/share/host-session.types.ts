import type { ShareHost } from "@canvas";

/** The file this app is sharing and its session. */
export interface HostedSession {
  fileId: string;
  host: ShareHost;
  /** Stops waiting on the session when the window closes. */
  releaseQuit: () => void;
}
