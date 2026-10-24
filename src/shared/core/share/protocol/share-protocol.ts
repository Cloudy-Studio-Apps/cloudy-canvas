import { isFileType } from "../../files";
import type { ShareControl, ShareFrame, ShareIdentity, ShareRole } from "./share-protocol.types";

/** The session protocol's version; guests of another one are turned away. */
export const SHARE_PROTOCOL = 1;

/** First byte of a frame: what follows. */
const TAG = { control: 0, sync: 1, awareness: 2 } as const;

const utf8 = new TextEncoder();
const fromUtf8 = new TextDecoder();

export function encodeFrame(frame: ShareFrame): Uint8Array {
  const body = frame.kind === "control" ? utf8.encode(JSON.stringify(frame.message)) : frame.data;
  const bytes = new Uint8Array(body.length + 1);
  bytes[0] = TAG[frame.kind];
  bytes.set(body, 1);
  return bytes;
}

/** A frame from a peer, or `null` when it isn't one this version reads. */
export function decodeFrame(bytes: Uint8Array): ShareFrame | null {
  const body = bytes.subarray(1);
  switch (bytes[0]) {
    case TAG.sync:
      return { kind: "sync", data: body };
    case TAG.awareness:
      return { kind: "awareness", data: body };
    case TAG.control: {
      let value: unknown;
      try {
        value = JSON.parse(fromUtf8.decode(body));
      } catch {
        return null;
      }
      const message = readControl(value);
      return message ? { kind: "control", message } : null;
    }
    default:
      return null;
  }
}

/** Checks a control message from a peer (untrusted input) field by field. */
function readControl(value: unknown): ShareControl | null {
  if (!isRecord(value)) return null;
  switch (value.type) {
    case "hello":
      return typeof value.protocol === "number" &&
        typeof value.appVersion === "string" &&
        typeof value.secret === "string" &&
        isIdentity(value.identity) &&
        (value.rejoin === null || typeof value.rejoin === "string")
        ? {
            type: "hello",
            protocol: value.protocol,
            appVersion: value.appVersion,
            secret: value.secret,
            identity: cleanIdentity(value.identity),
            rejoin: value.rejoin,
          }
        : null;
    case "waiting":
      return isIdentity(value.host) ? { type: "waiting", host: cleanIdentity(value.host) } : null;
    case "admitted": {
      const file = value.file;
      if (
        !isRole(value.role) ||
        !isIdentity(value.host) ||
        typeof value.appVersion !== "string" ||
        typeof value.rejoin !== "string" ||
        !isRecord(file) ||
        typeof file.product !== "string" ||
        !isFileType(file.product) ||
        typeof file.fileId !== "string" ||
        typeof file.fileName !== "string" ||
        !Array.isArray(file.plugins)
      )
        return null;
      return {
        type: "admitted",
        role: value.role,
        host: cleanIdentity(value.host),
        appVersion: value.appVersion,
        rejoin: value.rejoin,
        file: {
          product: file.product,
          fileId: file.fileId,
          fileName: file.fileName,
          plugins: file.plugins.filter((p): p is string => typeof p === "string"),
        },
      };
    }
    case "denied":
      return (value.reason === "refused" ||
        value.reason === "protocol" ||
        value.reason === "secret" ||
        value.reason === "full") &&
        typeof value.message === "string"
        ? { type: "denied", reason: value.reason, message: value.message }
        : null;
    case "role":
      return isRole(value.role) ? { type: "role", role: value.role } : null;
    case "removed":
      return { type: "removed" };
    case "ended":
      return { type: "ended" };
    default:
      return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRole(value: unknown): value is ShareRole {
  return value === "edit" || value === "view";
}

function isIdentity(value: unknown): value is ShareIdentity {
  return isRecord(value) && typeof value.name === "string" && typeof value.color === "string";
}

/** A name of sensible length and a colour that is one (names come from other people's apps). */
function cleanIdentity(identity: ShareIdentity): ShareIdentity {
  const name = identity.name.trim().slice(0, 40) || "Guest";
  const color = /^#[0-9a-f]{6}$/i.test(identity.color) ? identity.color : "#7c8a99";
  return { name, color };
}
