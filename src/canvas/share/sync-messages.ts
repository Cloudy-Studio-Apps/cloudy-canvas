import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";
import * as sync from "y-protocols/sync";
import type * as Y from "yjs";

/** A sync step 1: this side's state vector, asking the other for what it's missing. */
export function syncStep1(doc: Y.Doc): Uint8Array {
  const encoder = encoding.createEncoder();
  sync.writeSyncStep1(encoder, doc);
  return encoding.toUint8Array(encoder);
}

/** A document update, as a sync message. */
export function syncUpdate(update: Uint8Array): Uint8Array {
  const encoder = encoding.createEncoder();
  sync.writeUpdate(encoder, update);
  return encoding.toUint8Array(encoder);
}

/**
 * Reads a peer's sync message into `doc` (changes applied with `origin`) and returns the reply
 * to send, if any. Without `canWrite` the peer's changes are dropped (a viewer), but it still gets
 * what it asks for. `synced` is true when the message was the other side's whole state (step 2).
 */
export function readSync(
  doc: Y.Doc,
  data: Uint8Array,
  origin: unknown,
  canWrite: boolean,
): { reply: Uint8Array | null; synced: boolean } {
  const type = decoding.readVarUint(decoding.createDecoder(data));
  const writes = type === sync.messageYjsSyncStep2 || type === sync.messageYjsUpdate;
  if (writes && !canWrite) return { reply: null, synced: type === sync.messageYjsSyncStep2 };
  const encoder = encoding.createEncoder();
  sync.readSyncMessage(decoding.createDecoder(data), encoder, doc, origin);
  const reply = encoding.length(encoder) > 0 ? encoding.toUint8Array(encoder) : null;
  return { reply, synced: type === sync.messageYjsSyncStep2 };
}
