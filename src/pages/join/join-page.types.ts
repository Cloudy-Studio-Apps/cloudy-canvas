import type { ShareGuest } from "@canvas";
import type { ShareIdentity, ShareTicket } from "@shared/core";

export interface JoinSessionProps {
  /** The ticket as it was in the link (the session's key). */
  ticketText: string;
  ticket: ShareTicket;
  identity: ShareIdentity;
}

export interface JoinMessageProps {
  title: string;
  description?: string;
  /** Shows the hopping seal while something is under way. */
  busy?: boolean;
}

export interface JoinedSessionProps {
  guest: ShareGuest;
  /** The session is over: leave the page. */
  onEnd: () => void;
}

export interface ReconnectingBannerProps {
  host: string;
}
