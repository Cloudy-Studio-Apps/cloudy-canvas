import { Channel, invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import type {
  HostedConnection,
  JoinedConnection,
  PeerClosed,
  PeerPath,
  RelaySettings,
  RelayTestResult,
  ShareConnection,
  ShareTransport,
  ShareTransportHandlers,
} from "@shared/core";
import type { SessionEvent } from "./tauri-share-transport.types";

/**
 * Live sessions over iroh in the Tauri shell (`src-tauri/src/share`). Each session gets an id
 * from here: its connection events name it, and stopping it leaves a later one alone. Frames come
 * on the session's own channel, each prefixed with its peer number (u32, big endian).
 */
export class TauriShareTransport implements ShareTransport {
  private nextSession = 1;
  private readonly sessions = new Map<number, ShareTransportHandlers>();
  private listening: Promise<void> | null = null;

  async host(
    relay: RelaySettings | null,
    handlers: ShareTransportHandlers,
  ): Promise<HostedConnection> {
    const session = await this.open(handlers);
    try {
      const hosting = await invoke<{ addr: unknown; online: boolean }>("share_host", {
        session,
        relay,
        frames: this.frames(handlers),
      });
      return { ...hosting, connection: this.connection(session) };
    } catch (error) {
      this.sessions.delete(session);
      throw error;
    }
  }

  async join(
    addr: unknown,
    relay: RelaySettings | null,
    handlers: ShareTransportHandlers,
  ): Promise<JoinedConnection> {
    const session = await this.open(handlers);
    try {
      const peer = await invoke<number>("share_join", {
        session,
        addr,
        relay,
        frames: this.frames(handlers),
      });
      return { peer, connection: this.connection(session) };
    } catch (error) {
      this.sessions.delete(session);
      throw error;
    }
  }

  testRelay(relay: RelaySettings): Promise<RelayTestResult> {
    return invoke<RelayTestResult>("share_relay_test", { relay });
  }

  /** A new session id with its handlers, once the shell's events are heard. */
  private async open(handlers: ShareTransportHandlers): Promise<number> {
    await this.listen();
    const session = this.nextSession++;
    this.sessions.set(session, handlers);
    return session;
  }

  private connection(session: number): ShareConnection {
    return {
      send: (peer, frame) =>
        invoke("share_send", frame, {
          headers: { session: String(session), peer: String(peer) },
        }),
      closePeer: (peer, reason) => invoke("share_close_peer", { session, peer, reason }),
      peerPath: (peer) => invoke<PeerPath | null>("share_peer_path", { session, peer }),
      stop: async () => {
        await invoke("share_stop", { session });
        this.sessions.delete(session);
      },
    };
  }

  /** The channel a session's frames come on. */
  private frames(handlers: ShareTransportHandlers): Channel<ArrayBuffer> {
    const frames = new Channel<ArrayBuffer | number[]>();
    frames.onmessage = (data) => {
      const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : Uint8Array.from(data);
      if (bytes.length < 4) return;
      const peer = new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0);
      handlers.frame(peer, bytes.subarray(4));
    };
    return frames as Channel<ArrayBuffer>;
  }

  /** Listens for every session's connection events, once. */
  private listen(): Promise<void> {
    this.listening ??= Promise.all([
      listen<SessionEvent>("share://connected", ({ payload }) =>
        this.sessions.get(payload.session)?.connected(payload.peer),
      ),
      listen<PeerClosed & SessionEvent>("share://closed", ({ payload }) =>
        this.sessions.get(payload.session)?.closed(payload),
      ),
    ]).then(() => undefined);
    return this.listening;
  }
}
