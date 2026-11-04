import type { RawData } from "../services";

const HEAD_BYTES = 512;

/** Whether raw data is an HTML page (a login or error page) rather than data. */
export function isWebPage(raw: RawData): boolean {
  const mime = raw.mime?.split(";", 1)[0]?.trim().toLowerCase();
  if (mime === "text/html" || mime === "application/xhtml+xml") return true;
  const head =
    raw.text?.slice(0, HEAD_BYTES) ??
    (raw.bytes ? new TextDecoder().decode(raw.bytes.subarray(0, HEAD_BYTES)) : "");
  const start = head.trimStart().toLowerCase();
  return start.startsWith("<!doctype html") || start.startsWith("<html");
}
