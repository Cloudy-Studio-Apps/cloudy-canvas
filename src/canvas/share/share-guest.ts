import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from "y-protocols/awareness";
import * as Y from "yjs";

import {
  SHARE_PROTOCOL,
  decodeFrame,
  encodeFrame,
  type ShareConnection,
  type ShareControl,
  type ShareFrame,
  type ShareTransportHandlers,
} from "@shared/core";
import { Store, delay } from "../utils";
import { HOST_ORIGIN } from "./share-origins";
import type { ShareEndReason, ShareGuestOptions, ShareGuestState } from "./share-guest.types";
import { readSync, syncStep1, syncUpdate } from "./sync-messages";
import { t } from "./share.i18n";

/** How long a guest keeps trying to get back to the host after its connection dropped. */
const RECONNECT_FOR_MS = 30_000;
const RECONNECT_EVERY_MS = 2_000;

/**
 * A guest's side of a live session: it dials the host, waits to be let in, receives the file
 * into its own Yjs document (`doc`, empty until then) and keeps it in sync, with everyone's
 * presence in `awareness`. A dropped connection is retried for a while; the host ending the
 * session, removing the guest or turning it away closes it for good.
 */
export class ShareGuest {
  readonly doc = new Y.Doc();
  readonly awareness = new Awareness(this.doc);
  readonly state = new Store<ShareGuestState>({
    status: "connecting",
    role: null,
    file: null,
    host: null,
    hostVersion: null,
    end: null,
  });

  private connection: ShareConnection | null = null;
  private hostPeer: number | null = null;
  /** Counts connection attempts: events of an earlier connection are ignored. */
  private attempt = 0;
  private rejoin: string | null = null;
  private over = false;

  static join(options: ShareGuestOptions): ShareGuest {
    const guest = new ShareGuest(options);
    void guest.connect().then((ok) => {
      if (!ok)
        guest.end(
          "failed",
          "Couldn't reach the host. The link may be old, or the host's app closed.",
        );
    });
    return guest;
  }

  private constructor(private readonly options: ShareGuestOptions) {
    this.doc.on("update", (update: Uint8Array, origin: unknown) => {
      const { status, role } = this.state.get();
      if (origin === HOST_ORIGIN || role !== "edit") return;
      if (status !== "live" && status !== "syncing") return;
      this.sendBytes(encodeFrame({ kind: "sync", data: syncUpdate(update) }));
    });
    this.awareness.on(
      "update",
      (change: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => {
        if (origin !== "local") return;
        const changed = [...change.added, ...change.updated, ...change.removed];
        const data = encodeAwarenessUpdate(this.awareness, changed);
        this.sendBytes(encodeFrame({ kind: "awareness", data }));
      },
    );
  }

  /** Leaves the session (the guest closed the file). */
  leave(): void {
    this.end("left", "");
  }

  /** Dials the host and says hello; `false` when it can't be reached. */
  private async connect(): Promise<boolean> {
    const { ticket, transport, identity, appVersion } = this.options;
    try {
      const attempt = ++this.attempt;
      const joined = await transport.join(ticket.addr, ticket.relay, this.handlers(attempt));
      this.connection = joined.connection;
      this.hostPeer = joined.peer;
    } catch {
      return false;
    }
    if (this.over) {
      void this.connection.stop();
      return true;
    }
    this.send({
      type: "hello",
      protocol: SHARE_PROTOCOL,
      appVersion,
      secret: ticket.secret,
      identity,
      rejoin: this.rejoin,
    });
    return true;
  }

  private handlers(attempt: number): ShareTransportHandlers {
    const current = (peer: number) => attempt === this.attempt && peer === this.hostPeer;
    return {
      connected: () => {},
      frame: (peer, bytes) => {
        const frame = decodeFrame(bytes);
        if (current(peer) && frame) this.receive(frame);
      },
      closed: ({ peer }) => {
        if (!current(peer)) return;
        this.hostPeer = null;
        void this.lost();
      },
    };
  }

  private receive(frame: ShareFrame): void {
    if (frame.kind === "control") this.control(frame.message);
    else if (frame.kind === "awareness")
      applyAwarenessUpdate(this.awareness, frame.data, HOST_ORIGIN);
    else {
      const { reply, synced } = readSync(this.doc, frame.data, HOST_ORIGIN, true);
      if (reply) this.sendBytes(encodeFrame({ kind: "sync", data: reply }));
      if (synced && this.state.get().status === "syncing") this.patch({ status: "live" });
    }
  }

  private control(message: ShareControl): void {
    switch (message.type) {
      case "waiting":
        this.patch({ status: "waiting", host: message.host });
        return;
      case "admitted": {
        const back = this.rejoin !== null;
        this.rejoin = message.rejoin;
        this.patch({
          status: back ? "live" : "syncing",
          role: message.role,
          file: message.file,
          host: message.host,
          hostVersion: message.appVersion,
        });
        this.sendBytes(encodeFrame({ kind: "sync", data: syncStep1(this.doc) }));
        const mine = encodeAwarenessUpdate(this.awareness, [this.doc.clientID]);
        this.sendBytes(encodeFrame({ kind: "awareness", data: mine }));
        return;
      }
      case "role":
        this.patch({ role: message.role });
        return;
      case "denied":
        this.end("denied", message.message);
        return;
      case "removed":
        this.end("removed", t("guest.removed"));
        return;
      case "ended":
        this.end("ended", t("guest.ended"));
        return;
      case "hello":
        return;
    }
  }

  /** The connection dropped: try to get back while the session was on, else it's over. */
  private async lost(): Promise<void> {
    if (this.over) return;
    if (!this.rejoin) {
      this.end("lost", t("guest.lost"));
      return;
    }
    this.patch({ status: "reconnecting" });
    const deadline = Date.now() + RECONNECT_FOR_MS;
    while (!this.over && Date.now() < deadline) {
      await delay(RECONNECT_EVERY_MS);
      if (this.over) return;
      if (await this.connect()) return;
    }
    this.end("lost", t("guest.lostAgain"));
  }

  private end(reason: ShareEndReason, message: string): void {
    if (this.over) return;
    this.over = true;
    this.hostPeer = null;
    this.patch({ status: "closed", end: { reason, message } });
    this.awareness.destroy();
    void this.connection?.stop().catch(() => {});
  }

  private patch(patch: Partial<ShareGuestState>): void {
    this.state.set({ ...this.state.get(), ...patch });
  }

  private send(message: ShareControl): void {
    this.sendBytes(encodeFrame({ kind: "control", message }));
  }

  private sendBytes(bytes: Uint8Array): void {
    if (this.hostPeer === null) return;
    void this.connection?.send(this.hostPeer, bytes).catch(() => {});
  }
}
