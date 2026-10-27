import { isOwnFrame } from "./describe-error";
import type { DescribedError } from "./describe-error.types";

/**
 * A short code that's the same every time the same bug happens: a hash of the message and the
 * first frame of the app's own code (the first frame at all in a bundled build), "CC-7F3A-91C2".
 */
export function errorCode({ message, frames }: DescribedError): string {
  const frame = frames.find(isOwnFrame) ?? frames[0] ?? "";
  const hex = fnv1a(`${message}\n${frame}`).toString(16).toUpperCase().padStart(8, "0");
  return `CC-${hex.slice(0, 4)}-${hex.slice(4)}`;
}

/** 32-bit FNV-1a. */
function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
