import type { FileType } from "../../files.types";

/** What an admitted guest may do: edit with the host, or only watch. */
export type ShareRole = "edit" | "view";

/** Who someone in a session is, as others see them. */
export interface ShareIdentity {
  name: string;
  /** `#rrggbb` */
  color: string;
}

/** The file a session shares, as guests open it. */
export interface SharedFileInfo {
  product: FileType;
  /** The host's id for the file: every collaborator's presence names it. */
  fileId: string;
  fileName: string;
  /** Plugins the host has on for this product, so a guest can tell what it can't show. */
  plugins: string[];
}

/** Why a guest wasn't let in. */
export type ShareDenial = "refused" | "protocol" | "secret" | "full";

/** The session's own messages (everything but sync and presence), sent as JSON. */
export type ShareControl =
  /** A guest's first message. `rejoin` is the key it was given when it was let in before. */
  | {
      type: "hello";
      protocol: number;
      appVersion: string;
      secret: string;
      identity: ShareIdentity;
      rejoin: string | null;
    }
  /** The host will decide; the guest waits. */
  | { type: "waiting"; host: ShareIdentity }
  /** Let in. `rejoin` lets the guest back in with the same role if its connection drops. */
  | {
      type: "admitted";
      role: ShareRole;
      file: SharedFileInfo;
      host: ShareIdentity;
      appVersion: string;
      rejoin: string;
    }
  | { type: "denied"; reason: ShareDenial; message: string }
  /** The host changed the guest's role. */
  | { type: "role"; role: ShareRole }
  /** The host removed the guest. */
  | { type: "removed" }
  /** The host stopped sharing. */
  | { type: "ended" };

/** One frame on the wire: a control message, a Yjs sync message or an awareness update. */
export type ShareFrame =
  | { kind: "control"; message: ShareControl }
  | { kind: "sync"; data: Uint8Array }
  | { kind: "awareness"; data: Uint8Array };
