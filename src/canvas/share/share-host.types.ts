import type {
  RelaySettings,
  SharedFileInfo,
  ShareIdentity,
  ShareRole,
  ShareTransport,
} from "@shared/core";
import type { CanvasDocument } from "../document";

export interface ShareHostOptions {
  doc: CanvasDocument;
  transport: ShareTransport;
  /** The relay the session goes through (`null`: the public ones); it goes in the link. */
  relay: RelaySettings | null;
  file: SharedFileInfo;
  /** The host, as guests see them. */
  identity: ShareIdentity;
  appVersion: string;
}

/** Someone asking to join, waiting for the host. */
export interface ShareKnock {
  peer: number;
  identity: ShareIdentity;
  appVersion: string;
}

/** A guest that was let in. */
export interface ShareGuestInfo {
  peer: number;
  identity: ShareIdentity;
  role: ShareRole;
  appVersion: string;
  /** The Yjs client ids of its presence, to find it among the awareness states. */
  clients: readonly number[];
}

export interface ShareHostState {
  guests: readonly ShareGuestInfo[];
  knocks: readonly ShareKnock[];
}
