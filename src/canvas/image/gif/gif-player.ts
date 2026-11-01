import { decodeGifFrame } from "./decode-gif-frame";
import type { GifFile, GifFrame } from "./gif-file.types";

/**
 * Plays a GIF onto `canvas`, one frame at a time: frames are decoded as they're reached and laid
 * over the ones before (a GIF's frames are often only what changed), so one picture's worth of
 * pixels is kept however long it is. `canvas` is at most `long` pixels on its long side, never
 * larger than the picture. It loops forever.
 */
export class GifPlayer {
  readonly canvas: OffscreenCanvas;
  private readonly full: OffscreenCanvas;
  private readonly image: ImageData;
  /** What a frame that's put back afterwards drew over. */
  private saved: Uint8ClampedArray<ArrayBuffer> | null = null;
  private index = 0;

  constructor(
    private readonly file: GifFile,
    long: number,
  ) {
    const { width, height } = file;
    const scale = Math.min(1, long / Math.max(width, height));
    this.image = new ImageData(width, height);
    this.full = new OffscreenCanvas(width, height);
    this.canvas =
      scale === 1
        ? this.full
        : new OffscreenCanvas(
            Math.max(1, Math.round(width * scale)),
            Math.max(1, Math.round(height * scale)),
          );
    this.drawFrame();
  }

  /** How long the frame showing stays, in milliseconds. */
  get delay(): number {
    return this.frame.delay;
  }

  /** Whether the first frame is showing. */
  get atStart(): boolean {
    return this.index === 0;
  }

  /** Moves on to the next frame. */
  advance(): void {
    const previous = this.frame;
    this.index = (this.index + 1) % this.file.frames.length;
    if (this.index === 0) this.image.data.fill(0);
    else if (previous.disposal === "clear") this.clear(previous);
    else if (previous.disposal === "restore" && this.saved) this.image.data.set(this.saved);
    this.drawFrame();
  }

  /** Goes back to the first frame. */
  reset(): void {
    this.index = 0;
    this.image.data.fill(0);
    this.drawFrame();
  }

  private get frame(): GifFrame {
    return this.file.frames[this.index]!;
  }

  private drawFrame(): void {
    const frame = this.frame;
    if (frame.disposal === "restore") {
      this.saved ??= new Uint8ClampedArray(this.image.data.length);
      this.saved.set(this.image.data);
    }
    this.compose(frame);
    this.full.getContext("2d")?.putImageData(this.image, 0, 0);
    if (this.canvas === this.full) return;
    const context = this.canvas.getContext("2d");
    context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context?.drawImage(this.full, 0, 0, this.canvas.width, this.canvas.height);
  }

  /** Lays a frame over the picture so far (a frame may reach past the picture's edges). */
  private compose(frame: GifFrame): void {
    const { width, height, data } = this.file;
    const { palette, transparent } = frame;
    const indices = decodeGifFrame(data, frame);
    const pixels = this.image.data;
    const rows = Math.min(frame.h, height - frame.y);
    const columns = Math.min(frame.w, width - frame.x);
    for (let row = 0; row < rows; row++) {
      let from = row * frame.w;
      let to = ((frame.y + row) * width + frame.x) * 4;
      for (let column = 0; column < columns; column++, from++, to += 4) {
        const index = indices[from]!;
        const color = index * 3;
        if (index === transparent || color + 2 >= palette.length) continue;
        pixels[to] = palette[color]!;
        pixels[to + 1] = palette[color + 1]!;
        pixels[to + 2] = palette[color + 2]!;
        pixels[to + 3] = 255;
      }
    }
  }

  /** Clears a frame's area, within the picture. */
  private clear(frame: GifFrame): void {
    const { width, height } = this.file;
    const right = Math.min(frame.x + frame.w, width);
    const bottom = Math.min(frame.y + frame.h, height);
    for (let y = frame.y; y < bottom; y++)
      this.image.data.fill(0, (y * width + frame.x) * 4, (y * width + right) * 4);
  }
}
