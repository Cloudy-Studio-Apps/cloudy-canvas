import type { CanvasSource } from "pixi.js";

import type { GifPlayer } from "../image";

/** A GIF `GifPlayback` plays: its player, the texture source showing it and when it next moves. */
export interface PlayingGif {
  player: GifPlayer;
  source: CanvasSource;
  /** The time (`performance.now`) its next frame is due. */
  due: number;
}
