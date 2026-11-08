import type { FrameElement } from "../../../frame";

/** One screen picture the player keeps. */
export interface ScreenPictureEntry {
  /** The screen as it was drawn: a changed screen is a new object, so it's drawn again. */
  screen: FrameElement;
  /** Pixels per world unit it was drawn at. */
  scale: number;
  picture: Promise<string>;
  /** Set once the picture is drawn (an object URL). */
  url: string | null;
  /** Replaced or cleared: its URL is revoked (as soon as it's drawn, if it isn't yet). */
  dropped: boolean;
}
