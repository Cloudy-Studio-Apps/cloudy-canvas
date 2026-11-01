import type { GifDisposal, GifFile, GifFrame } from "./gif-file.types";

/** Larger pictures stay still: compositing them each frame would stall the canvas. */
const MAX_GIF_PIXELS = 4096 * 4096;

const IMAGE_BLOCK = 0x2c;
const EXTENSION_BLOCK = 0x21;
const GRAPHIC_CONTROL = 0xf9;

/** Browsers show frames this short (or with no delay) at `DEFAULT_DELAY_MS`. */
const MIN_DELAY_MS = 10;
const DEFAULT_DELAY_MS = 100;

/** The graphic control extension's part of a frame. */
type FrameControl = Pick<GifFrame, "delay" | "disposal" | "transparent">;

const NO_CONTROL: FrameControl = {
  delay: DEFAULT_DELAY_MS,
  disposal: "keep",
  transparent: null,
};

function u16(data: Uint8Array, at: number): number {
  return data[at]! | (data[at + 1]! << 8);
}

/** Past the sub-blocks starting at `at`, or `-1` when the file ends first. */
function skipBlocks(data: Uint8Array, at: number): number {
  while (at < data.length) {
    const size = data[at]!;
    if (size === 0) return at + 1;
    at += size + 1;
  }
  return -1;
}

function disposalOf(code: number): GifDisposal {
  if (code === 2) return "clear";
  return code === 3 || code === 4 ? "restore" : "keep";
}

/** Reads the graphic control extension that starts at `at`. */
function readControl(data: Uint8Array, at: number): FrameControl {
  const flags = data[at + 3]!;
  const delay = u16(data, at + 4) * 10;
  return {
    delay: delay <= MIN_DELAY_MS ? DEFAULT_DELAY_MS : delay,
    disposal: disposalOf((flags >> 2) & 7),
    transparent: flags & 1 ? data[at + 6]! : null,
  };
}

/** The bytes of a color table of the size its flags say. */
function tableBytes(flags: number): number {
  return flags & 0x80 ? 3 << ((flags & 7) + 1) : 0;
}

/**
 * A GIF's frames, read without decoding their pixels; `null` when `data` isn't a GIF of two
 * frames or more, or it's too large to play. A file cut short keeps the frames that are whole.
 */
export function parseAnimatedGif(data: Uint8Array): GifFile | null {
  if (data.length < 13 || data[0] !== 0x47 || data[1] !== 0x49 || data[2] !== 0x46) return null;
  const width = u16(data, 6);
  const height = u16(data, 8);
  if (width * height === 0 || width * height > MAX_GIF_PIXELS) return null;

  const globalFlags = data[10]!;
  const globalBytes = tableBytes(globalFlags);
  const globalPalette = data.subarray(13, 13 + globalBytes);
  const frames: GifFrame[] = [];
  let control = NO_CONTROL;
  let at = 13 + globalBytes;

  while (at > 0 && at < data.length) {
    const block = data[at]!;
    if (block === EXTENSION_BLOCK) {
      if (data[at + 1] === GRAPHIC_CONTROL && at + 7 < data.length) control = readControl(data, at);
      at = skipBlocks(data, at + 2);
    } else if (block === IMAGE_BLOCK) {
      const flags = data[at + 9] ?? 0;
      const localBytes = tableBytes(flags);
      const tableStart = at + 10;
      const codeAt = tableStart + localBytes;
      const minCodeSize = data[codeAt] ?? 0;
      const end = skipBlocks(data, codeAt + 1);
      if (end < 0 || minCodeSize < 1 || minCodeSize > 8) break;
      frames.push({
        ...control,
        x: u16(data, at + 1),
        y: u16(data, at + 3),
        w: u16(data, at + 5),
        h: u16(data, at + 7),
        palette: localBytes > 0 ? data.subarray(tableStart, codeAt) : globalPalette,
        interlaced: (flags & 0x40) !== 0,
        minCodeSize,
        start: codeAt + 1,
      });
      control = NO_CONTROL;
      at = end;
    } else break;
  }
  return frames.length > 1 ? { data, width, height, frames } : null;
}

/** Whether a file is a GIF that moves. */
export function isAnimatedGif(data: Uint8Array): boolean {
  return parseAnimatedGif(data) !== null;
}
