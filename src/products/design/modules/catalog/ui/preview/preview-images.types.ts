import type { FrameElement } from "@design";

/** One page picture the preview keeps. */
export interface PreviewImageEntry {
  /** The frame as it was drawn: a changed frame is a new object, so it's drawn again. */
  frame: FrameElement;
  picture: Promise<string>;
  /** Set once the picture is drawn. */
  url: string | null;
}
