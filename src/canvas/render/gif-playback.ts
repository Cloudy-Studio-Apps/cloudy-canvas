import { CanvasSource, Texture, type ICanvas } from "pixi.js";

import { GifPlayer, type GifFile } from "../image";
import { prefersReducedMotion } from "../utils";
import type { PlayingGif } from "./gif-playback.types";

/** Time a round of frames may take; GIFs it didn't reach move in the next one. */
const TICK_BUDGET_MS = 6;

/** How often a hidden window is checked for coming back. */
const HIDDEN_CHECK_MS = 500;

const NONE: ReadonlySet<string> = new Set();

/**
 * The GIFs that move on the canvas. Each has one texture, shared by every view showing it, whose
 * pixels change, so views aren't drawn again. Only GIFs on screen move (`show`, every render) and
 * a timer wakes for the next frame due, so the canvas renders at the GIFs' pace, not the display's,
 * and not at all with none on screen. With playback off or the system asking for less motion they
 * rest on their first frame.
 */
export class GifPlayback {
  private readonly gifs = new Map<string, PlayingGif>();
  private visible = NONE;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private enabled = true;

  /** `onFrame` is called when a texture changed, so the canvas draws again. */
  constructor(private readonly onFrame: () => void) {}

  /** Starts a GIF on its first frame; its texture is `long` pixels on its long side at most. */
  open(assetId: string, file: GifFile, long: number): Texture {
    const player = new GifPlayer(file, long);
    const { width, height } = player.canvas;
    const source = new CanvasSource({
      resource: player.canvas as unknown as ICanvas,
      width,
      height,
      resolution: 1,
      // Mipmaps keep pictures smooth when zoomed out, as `ImageCache` does.
      autoGenerateMipmaps: true,
    });
    this.gifs.set(assetId, { player, source, due: performance.now() + player.delay });
    return new Texture({ source });
  }

  /** The GIFs on screen now. */
  show(visible: ReadonlySet<string>): void {
    this.visible = visible;
    if (this.timer === null) this.schedule();
  }

  /** Turns playback on or off. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.stop();
    this.schedule();
    if (!enabled) this.rest();
  }

  destroy(): void {
    this.stop();
    this.gifs.clear();
    this.visible = NONE;
  }

  private get moving(): boolean {
    return this.enabled && !prefersReducedMotion();
  }

  private stop(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }

  /** Sets the timer for the next frame due on screen; with none, it stays unset until `show`. */
  private schedule(): void {
    if (this.visible.size === 0) return;
    if (!this.moving) return this.rest();
    let next = Infinity;
    for (const assetId of this.visible)
      next = Math.min(next, this.gifs.get(assetId)?.due ?? Infinity);
    if (next === Infinity) return;
    this.wake(next - performance.now());
  }

  private wake(delay: number): void {
    this.timer = setTimeout(() => this.tick(), Math.max(0, delay));
  }

  private tick(): void {
    this.timer = null;
    if (document.hidden) return this.wake(HIDDEN_CHECK_MS);
    if (!this.moving) return this.rest();
    const now = performance.now();
    let moved = false;
    for (const assetId of this.visible) {
      const gif = this.gifs.get(assetId);
      if (!gif || gif.due > now) continue;
      gif.player.advance();
      gif.source.update();
      gif.due = now + gif.player.delay;
      moved = true;
      if (performance.now() - now > TICK_BUDGET_MS) break;
    }
    if (moved) this.onFrame();
    this.schedule();
  }

  /** Puts every GIF back on its first frame. */
  private rest(): void {
    let moved = false;
    for (const { player, source } of this.gifs.values()) {
      if (player.atStart) continue;
      player.reset();
      source.update();
      moved = true;
    }
    if (moved) this.onFrame();
  }
}
