import type { RawData } from "../services";

/** The text of raw data: its `text`, or its bytes decoded as UTF-8; a leading BOM is dropped. */
export function rawText(raw: RawData): string {
  const text =
    raw.text ?? (raw.bytes ? new TextDecoder("utf-8", { ignoreBOM: false }).decode(raw.bytes) : "");
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}
