/** What happens to a frame's area before the next one: left, cleared or put back as it was. */
export type GifDisposal = "keep" | "clear" | "restore";

/** One frame of a GIF, as read from the file: its pixels aren't decoded until they're drawn. */
export interface GifFrame {
  /** Its area on the picture, in pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** How long it shows, in milliseconds. */
  delay: number;
  disposal: GifDisposal;
  /** The color index that leaves the pixel under it, if any. */
  transparent: number | null;
  /** Its colors, three bytes each (a view of the file). */
  palette: Uint8Array;
  interlaced: boolean;
  /** The LZW minimum code size. */
  minCodeSize: number;
  /** Where its compressed sub-blocks start in the file. */
  start: number;
}

/** An animated GIF: the file and where its frames are in it. */
export interface GifFile {
  data: Uint8Array;
  width: number;
  height: number;
  frames: readonly GifFrame[];
}
