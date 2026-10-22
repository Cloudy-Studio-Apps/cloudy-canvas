import { unzipSync } from "fflate";

import type { FigmaImportProgress } from "../figma-import.types";
import { decodeKiwi, decodeKiwiSchema } from "../kiwi";
import { decompressChunk } from "./decompress-chunk";
import type { FigContainer } from "./fig-container.types";

const latin1 = new TextDecoder("latin1");
const utf8 = new TextDecoder();

/** The canvas prelude of Figma design files; FigJam and Slides files use other ones. */
const DESIGN_PRELUDE = "fig-kiwi";
const OTHER_PRELUDES: Record<string, string> = {
  "fig-jam.": "a FigJam board",
  "fig-deck": "a Figma Slides deck",
};
const CANVAS_ENTRY = "canvas.fig";
const IMAGES_FOLDER = "images/";

/** Whether `bytes` look like a Figma file: a zip (newer files) or a bare canvas (older ones). */
export function isFigmaFile(bytes: Uint8Array): boolean {
  return isZip(bytes) || latin1.decode(bytes.subarray(0, 8)) === DESIGN_PRELUDE;
}

/**
 * Unpacks a `.fig` file ("Save local copy…") and decodes its canvas. Throws for other files.
 * `onProgress` hears when it starts unpacking and decoding.
 */
export function readFigFile(bytes: Uint8Array, onProgress?: FigmaImportProgress): FigContainer {
  if (!isZip(bytes)) return { ...readCanvas(bytes, onProgress), images: new Map(), name: null };
  onProgress?.("Unpacking");
  const entries = unzipSync(bytes);
  const canvas = entries[CANVAS_ENTRY];
  if (!canvas) throw new Error("This zip isn't a Figma file: it has no canvas.");
  const images = new Map<string, Uint8Array>();
  for (const [path, data] of Object.entries(entries)) {
    if (path.startsWith(IMAGES_FOLDER) && data.length > 0) {
      images.set(path.slice(IMAGES_FOLDER.length), data);
    }
  }
  return { ...readCanvas(canvas, onProgress), images, name: metaName(entries["meta.json"]) };
}

/** The canvas: the prelude, a u32 version, then length-prefixed chunks (schema, then data). */
function readCanvas(
  bytes: Uint8Array,
  onProgress?: FigmaImportProgress,
): Pick<FigContainer, "version" | "message"> {
  const prelude = latin1.decode(bytes.subarray(0, 8));
  if (prelude !== DESIGN_PRELUDE) {
    const other = OTHER_PRELUDES[prelude];
    throw new Error(other ? `This is ${other}, not a design.` : "This isn't a Figma file.");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint32(8, true);
  const chunks: Uint8Array[] = [];
  for (let offset = 12; offset + 4 <= bytes.length;) {
    const length = view.getUint32(offset, true);
    chunks.push(bytes.subarray(offset + 4, offset + 4 + length));
    offset += 4 + length;
  }
  const [schemaChunk, dataChunk] = chunks;
  if (!schemaChunk || !dataChunk) throw new Error("The Figma file is incomplete.");
  onProgress?.("Decoding");
  const schema = decodeKiwiSchema(decompressChunk(schemaChunk));
  return { version, message: decodeKiwi(schema, "Message", decompressChunk(dataChunk)) };
}

function metaName(meta: Uint8Array | undefined): string | null {
  if (!meta) return null;
  try {
    const parsed: unknown = JSON.parse(utf8.decode(meta));
    const name = (parsed as { file_name?: unknown }).file_name;
    return typeof name === "string" && name ? name : null;
  } catch {
    return null;
  }
}

function isZip(bytes: Uint8Array): boolean {
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}
