import type { Camera } from "./camera";
import type { CameraView } from "./camera-glide.types";
import { rectCenter } from "./geometry";
import type { Rect } from "./geometry.types";
import { prefersReducedMotion } from "./utils";

const GLIDE_MS = 400;

/**
 * Moves the camera smoothly to show a world area exactly (following a collaborator's view): an
 * ease-out over the centre and the zoom (the zoom eased on a log scale, so it feels even). It
 * jumps with reduced motion; a new glide or `cancel` stops the one running.
 */
export class CameraGlide {
  private frame: number | null = null;

  constructor(
    private readonly camera: Camera,
    private readonly onStep: () => void,
  ) {}

  start(area: Rect, animate = true): void {
    this.cancel();
    const to: CameraView = {
      center: rectCenter(area),
      zoom: this.camera.fitZoom(area, { padding: 0, maxZoom: Infinity }),
    };
    if (!animate || prefersReducedMotion()) {
      this.apply(to);
      return;
    }
    const from: CameraView = {
      center: rectCenter(this.camera.visibleWorldRect()),
      zoom: this.camera.zoom,
    };
    const started = performance.now();
    const step = (time: number) => {
      const t = Math.min(1, (time - started) / GLIDE_MS);
      this.apply(between(from, to, 1 - (1 - t) ** 3));
      this.frame = t < 1 ? requestAnimationFrame(step) : null;
    };
    this.frame = requestAnimationFrame(step);
  }

  cancel(): void {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  private apply({ center, zoom }: CameraView): void {
    this.camera.zoomAtCenter(zoom);
    this.camera.centerOn(center);
    this.onStep();
  }
}

function between(from: CameraView, to: CameraView, k: number): CameraView {
  return {
    center: {
      x: from.center.x + (to.center.x - from.center.x) * k,
      y: from.center.y + (to.center.y - from.center.y) * k,
    },
    zoom: Math.exp(Math.log(from.zoom) + (Math.log(to.zoom) - Math.log(from.zoom)) * k),
  };
}
