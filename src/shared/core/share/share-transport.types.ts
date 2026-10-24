/** A relay of the user's own (`server/relay`): its URL and the token it asks for. */
export interface RelaySettings {
  url: string;
  token: string | null;
}

/** How a peer is reached: straight to it (hole punching worked) or through the relay. */
export type PeerPath = "direct" | "relay";

/** A peer's connection ended: closed on purpose (`message` is the reason given) or lost. */
export interface PeerClosed {
  peer: number;
  kind: "closed" | "lost";
  message: string;
}

/** What a session's transport reports. Peers are numbers the transport gives each connection. */
export interface ShareTransportHandlers {
  connected(peer: number): void;
  frame(peer: number, frame: Uint8Array): void;
  closed(event: PeerClosed): void;
}

/** One session's connections: hosting, or joined to a host. */
export interface ShareConnection {
  send(peer: number, frame: Uint8Array): Promise<void>;
  /** Disconnects one peer, telling it `reason`. */
  closePeer(peer: number, reason: string): Promise<void>;
  /** How the peer is reached now, `null` before there's a path. */
  peerPath(peer: number): Promise<PeerPath | null>;
  /** Ends the session: every peer is disconnected. Does nothing once another session started. */
  stop(): Promise<void>;
}

/** A hosting session: where guests dial it, and whether the relay can reach it. */
export interface HostedConnection {
  connection: ShareConnection;
  /** The transport's own address (opaque JSON), put in the session's link. */
  addr: unknown;
  /** Reachable through the relay; `false` means only the local network can reach it. */
  online: boolean;
}

/** A session joined to a host. */
export interface JoinedConnection {
  connection: ShareConnection;
  /** The host's peer number. */
  peer: number;
}

export interface RelayTestResult {
  ok: boolean;
  /** How long coming online through the relay took. */
  millis: number | null;
  error: string | null;
}

/**
 * Peer-to-peer connections for live sessions: the app hosting a file and the guests connected to
 * it exchange frames. Implemented per platform in `platform/` (desktop: iroh in the Tauri shell);
 * there is none where the app can't (the browser), and a web build would bring its own.
 * One session at a time: hosting or joining ends the one before.
 */
export interface ShareTransport {
  /** Starts hosting through `relay` (`null`: the public ones). */
  host(relay: RelaySettings | null, handlers: ShareTransportHandlers): Promise<HostedConnection>;
  /** Connects to the host at `addr` through its relay. */
  join(
    addr: unknown,
    relay: RelaySettings | null,
    handlers: ShareTransportHandlers,
  ): Promise<JoinedConnection>;
  /** Checks that the app comes online through `relay`. */
  testRelay(relay: RelaySettings): Promise<RelayTestResult>;
}
