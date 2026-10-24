import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";

import {
  SHARE_PROTOCOL,
  createId,
  createShareSecret,
  decodeFrame,
  encodeFrame,
  shareLink,
  type PeerPath,
  type ShareControl,
  type ShareFrame,
  type ShareConnection,
  type ShareRole,
  type ShareTransportHandlers,
} from "@shared/core";
import { Store, delay } from "../utils";
import { clearTimer, hostSnapshot, newPeer } from "./host-peers";
import type { HostPeer } from "./host-peers.types";
import { GOODBYE_MS, HELLO_TIMEOUT_MS, MAX_GUESTS } from "./share-origins";
import type { ShareHostOptions, ShareHostState } from "./share-host.types";
import { readSync, syncStep1, syncUpdate } from "./sync-messages";

/**
 * The host's side of a live session: the document lives here and guests sync with it (a star:
 * the host relays every change and presence update to the others). It checks each guest's secret,
 * asks the host about each newcomer (`knocks`), and drops changes from viewers.
 */
export class ShareHost {
  readonly awareness: Awareness;
  readonly state = new Store<ShareHostState>({ guests: [], knocks: [] });
  /** The link guests open; set once the transport is hosting. */
  link = "";
  /** Reachable through the relay (`false`: only on the local network). */
  online = false;

  private readonly secret = createShareSecret();
  private readonly peers = new Map<number, HostPeer>();
  /** Keys given to admitted guests: one comes back with the same role after a dropped connection. */
  private readonly rejoins = new Map<string, ShareRole>();
  private readonly stopDoc: () => void;
  private connection: ShareConnection | null = null;
  private stopped = false;

  static async start(options: ShareHostOptions): Promise<ShareHost> {
    const host = new ShareHost(options);
    try {
      const hosted = await options.transport.host(options.relay, host.handlers());
      host.connection = hosted.connection;
      host.online = hosted.online;
      host.link = shareLink({ addr: hosted.addr, relay: options.relay, secret: host.secret });
      return host;
    } catch (error) {
      host.dispose();
      throw error;
    }
  }

  private constructor(private readonly options: ShareHostOptions) {
    const doc = options.doc.doc;
    this.awareness = new Awareness(doc);
    const onUpdate = (update: Uint8Array, origin: unknown) => {
      const message = encodeFrame({ kind: "sync", data: syncUpdate(update) });
      for (const p of this.admitted()) if (origin !== p.origin) this.sendBytes(p.peer, message);
    };
    doc.on("update", onUpdate);
    this.awareness.on("update", this.onAwareness);
    this.stopDoc = () => doc.off("update", onUpdate);
  }

  admit(peer: number, role: ShareRole): void {
    const p = this.peers.get(peer);
    if (!p || p.stage !== "knocking") return;
    const rejoin = createId();
    this.rejoins.set(rejoin, role);
    this.welcome(p, role, rejoin);
  }

  deny(peer: number): void {
    const p = this.peers.get(peer);
    if (!p || p.stage !== "knocking") return;
    this.dismiss(p, { type: "denied", reason: "refused", message: "The host didn't let you in." });
  }

  setRole(peer: number, role: ShareRole): void {
    const p = this.peers.get(peer);
    if (!p || p.stage !== "admitted" || p.role === role) return;
    p.role = role;
    if (p.rejoin) this.rejoins.set(p.rejoin, role);
    this.send(peer, { type: "role", role });
    this.publish();
  }

  remove(peer: number): void {
    const p = this.peers.get(peer);
    if (!p) return;
    this.dismiss(p, { type: "removed" });
  }

  /** How a guest is reached now (`direct` or through the relay), `null` before there's a path. */
  peerPath(peer: number): Promise<PeerPath | null> {
    return this.connection?.peerPath(peer) ?? Promise.resolve(null);
  }

  /** Tells every guest the session ended, gives them a moment to close, then stops hosting. */
  async stop(): Promise<void> {
    if (this.stopped) return;
    this.stopped = true;
    for (const p of this.peers.values()) this.send(p.peer, { type: "ended" });
    const deadline = Date.now() + 1_000;
    while (this.peers.size > 0 && Date.now() < deadline) await delay(50);
    await this.connection?.stop().catch(() => {});
    this.dispose();
  }

  private handlers(): ShareTransportHandlers {
    return {
      connected: (peer) => {
        const p = newPeer(peer);
        p.timer = setTimeout(() => void this.close(peer, "no hello"), HELLO_TIMEOUT_MS);
        this.peers.set(peer, p);
      },
      frame: (peer, bytes) => {
        const p = this.peers.get(peer);
        const frame = decodeFrame(bytes);
        if (p && frame) this.receive(p, frame);
      },
      closed: ({ peer }) => {
        const p = this.peers.get(peer);
        if (!p) return;
        clearTimer(p);
        this.peers.delete(peer);
        if (p.clients.size > 0) removeAwarenessStates(this.awareness, [...p.clients], "host");
        this.publish();
      },
    };
  }

  private receive(p: HostPeer, frame: ShareFrame): void {
    if (p.stage === "hello") {
      if (frame.kind === "control" && frame.message.type === "hello") this.hello(p, frame.message);
      return;
    }
    if (p.stage !== "admitted") return;
    if (frame.kind === "sync") {
      const { reply } = readSync(this.options.doc.doc, frame.data, p.origin, p.role === "edit");
      if (reply) this.sendBytes(p.peer, encodeFrame({ kind: "sync", data: reply }));
    } else if (frame.kind === "awareness") {
      applyAwarenessUpdate(this.awareness, frame.data, p.origin);
    }
  }

  private hello(p: HostPeer, hello: Extract<ShareControl, { type: "hello" }>): void {
    clearTimer(p);
    p.identity = hello.identity;
    p.appVersion = hello.appVersion;
    if (hello.protocol !== SHARE_PROTOCOL) {
      const message = "This session needs another version of Cloudy Canvas: update both apps.";
      this.dismiss(p, { type: "denied", reason: "protocol", message });
    } else if (hello.secret !== this.secret) {
      const message = "This link is from a session that has ended.";
      this.dismiss(p, { type: "denied", reason: "secret", message });
    } else if (hello.rejoin && this.rejoins.has(hello.rejoin)) {
      // Back after a dropped connection: let in again as it was.
      this.welcome(p, this.rejoins.get(hello.rejoin) ?? "view", hello.rejoin);
    } else if (this.guestCount() >= MAX_GUESTS) {
      const message = `This session already has ${MAX_GUESTS} guests.`;
      this.dismiss(p, { type: "denied", reason: "full", message });
    } else {
      p.stage = "knocking";
      this.send(p.peer, { type: "waiting", host: this.options.identity });
      this.publish();
    }
  }

  private welcome(p: HostPeer, role: ShareRole, rejoin: string): void {
    p.stage = "admitted";
    p.role = role;
    p.rejoin = rejoin;
    const { file, identity, appVersion, doc } = this.options;
    this.send(p.peer, { type: "admitted", role, file, host: identity, appVersion, rejoin });
    // Ask for what it has (edits made while its connection was down), then everyone's presence.
    this.sendBytes(p.peer, encodeFrame({ kind: "sync", data: syncStep1(doc.doc) }));
    const clients = [...this.awareness.getStates().keys()];
    const presence = encodeAwarenessUpdate(this.awareness, clients);
    this.sendBytes(p.peer, encodeFrame({ kind: "awareness", data: presence }));
    this.publish();
  }

  /** Relays presence changes to the guests that didn't send them, and keeps who sent which. */
  private readonly onAwareness = (
    change: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown,
  ) => {
    const from = this.admitted().find((p) => p.origin === origin);
    if (from) {
      for (const id of [...change.added, ...change.updated]) from.clients.add(id);
      for (const id of change.removed) from.clients.delete(id);
    }
    const changed = [...change.added, ...change.updated, ...change.removed];
    const message = encodeFrame({
      kind: "awareness",
      data: encodeAwarenessUpdate(this.awareness, changed),
    });
    for (const p of this.admitted()) if (p !== from) this.sendBytes(p.peer, message);
    if (from && change.added.length > 0) this.publish();
  };

  /** Sends a parting message and closes the connection if the peer doesn't. */
  private dismiss(p: HostPeer, message: ShareControl): void {
    this.send(p.peer, message);
    p.stage = "leaving";
    // A removed guest can't come back on its own.
    if (p.rejoin) this.rejoins.delete(p.rejoin);
    clearTimer(p);
    p.timer = setTimeout(() => void this.close(p.peer, message.type), GOODBYE_MS);
    this.publish();
  }

  private admitted(): HostPeer[] {
    return [...this.peers.values()].filter((p) => p.stage === "admitted");
  }

  private guestCount(): number {
    return [...this.peers.values()].filter((p) => p.stage === "knocking" || p.stage === "admitted")
      .length;
  }

  private publish(): void {
    this.state.set(hostSnapshot(this.peers.values()));
  }

  private send(peer: number, message: ShareControl): void {
    this.sendBytes(peer, encodeFrame({ kind: "control", message }));
  }

  private sendBytes(peer: number, bytes: Uint8Array): void {
    void this.connection?.send(peer, bytes).catch(() => {});
  }

  private close(peer: number, reason: string): Promise<void> {
    return this.connection?.closePeer(peer, reason).catch(() => {}) ?? Promise.resolve();
  }

  private dispose(): void {
    this.stopDoc();
    this.awareness.off("update", this.onAwareness);
    this.awareness.destroy();
    this.state.destroy();
  }
}
