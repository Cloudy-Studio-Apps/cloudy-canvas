import type { Camera } from "../camera";
import type { Point } from "../geometry.types";

/** Distance from the viewport edge (screen px) where auto-panning starts. */
const EDGE_PX = 48;
/** Pan speed at the very edge, in screen px per frame. */
const MAX_SPEED_PX = 18;

/**
 * Pans the camera while a drag holds the pointer near the viewport edge, so a gesture can reach
 * shapes that are far away. Runs on animation frames until `update(null)`.
 */
export class EdgeAutoPan {
  private frame = 0;
  private screen: Point | null = null;
  private onPan: (() => void) | null = null;

  constructor(
    private readonly camera: Camera,
    private readonly panBy: (dx: number, dy: number) => void,
  ) {}

  /** Sets the pointer position (screen px); `null` stops. `onPan` runs after every pan step. */
  update(screen: Point | null, onPan?: () => void): void {
    this.screen = screen;
    this.onPan = onPan ?? null;
    if (!screen) return this.stop();
    this.frame ||= requestAnimationFrame(this.tick);
  }

  stop(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.screen = null;
    this.onPan = null;
  }

  private tick = () => {
    this.frame = 0;
    const screen = this.screen;
    if (!screen) return;
    const vx = edgeSpeed(screen.x, this.camera.viewport.w);
    const vy = edgeSpeed(screen.y, this.camera.viewport.h);
    if (vx !== 0 || vy !== 0) {
      // Content moves opposite to the direction we want to see more of.
      this.panBy(-vx, -vy);
      this.onPan?.();
    }
    this.frame = requestAnimationFrame(this.tick);
  };
}

function edgeSpeed(position: number, size: number): number {
  if (position < EDGE_PX) return -MAX_SPEED_PX * Math.min(1, (EDGE_PX - position) / EDGE_PX);
  if (position > size - EDGE_PX)
    return MAX_SPEED_PX * Math.min(1, (position - (size - EDGE_PX)) / EDGE_PX);
  return 0;
}
