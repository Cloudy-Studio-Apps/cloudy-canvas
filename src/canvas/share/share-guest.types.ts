import type {
  SharedFileInfo,
  ShareIdentity,
  ShareRole,
  ShareTicket,
  ShareTransport,
} from "@shared/core";

export interface ShareGuestOptions {
  ticket: ShareTicket;
  transport: ShareTransport;
  /** The guest, as the host and the others see them. */
  identity: ShareIdentity;
  appVersion: string;
}

/**
 * Where joining is: dialing the host, waiting for it to decide, receiving the file, editing live,
 * trying to get back after a dropped connection, or over (`end` says why).
 */
export type ShareGuestStatus =
  "connecting" | "waiting" | "syncing" | "live" | "reconnecting" | "closed";

/** Why a guest's session is over. */
export type ShareEndReason = "ended" | "removed" | "denied" | "lost" | "failed" | "left";

export interface ShareGuestState {
  status: ShareGuestStatus;
  role: ShareRole | null;
  file: SharedFileInfo | null;
  host: ShareIdentity | null;
  /** The host's app version, once let in. */
  hostVersion: string | null;
  end: { reason: ShareEndReason; message: string } | null;
}
