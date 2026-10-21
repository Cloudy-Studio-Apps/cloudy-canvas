/** Runs `callback` at most once per animation frame, only when requested (render on demand). */
export class FrameScheduler {
  private frame = 0;
  private enabled = false;

  constructor(private readonly callback: () => void) {}

  start(): void {
    this.enabled = true;
  }

  request(): void {
    if (this.frame || !this.enabled) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      if (this.enabled) this.callback();
    });
  }

  stop(): void {
    this.enabled = false;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }
}
