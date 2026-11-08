import type { CanvasElement } from "@canvas";

import type { FrameElement } from "../../../frame";

/** One screen picture the player keeps. */
export interface ScreenPictureEntry {
  /** The screen as it was drawn. */
  screen: FrameElement;
  /** The screen and every layer inside it as they were drawn (see `screenContent`). */
  content: readonly CanvasElement[];
  /** Pixels per world unit it was drawn at. */
  scale: number;
  picture: Promise<string>;
  /** Set once the picture is drawn (an object URL). */
  url: string | null;
  /** Replaced or cleared: its URL is revoked (as soon as it's drawn, if it isn't yet). */
  dropped: boolean;
}
