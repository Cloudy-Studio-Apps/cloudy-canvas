import type { Point } from "../geometry.types";
import { toCanvasPointer } from "./canvas-pointer";
import type { TouchNavigationHost } from "./touch-navigation.types";

/**
 * Moves the camera with the fingers on the canvas, whatever tool is on: they drag it along and
 * spreading them zooms at their center, so what's under them stays under them. It lasts until the
 * last finger lifts, so lifting one mid-pinch never hands the other to the tool.
 */
export class TouchNavigation {
  private readonly fingers = new Map<number, Point>();
  private center: Point = { x: 0, y: 0 };
  private spread = 0;

  constructor(private readonly host: TouchNavigationHost) {}

  get active(): boolean {
    return this.fingers.size > 0;
  }

  has(pointerId: number): boolean {
    return this.fingers.has(pointerId);
  }

  add(event: PointerEvent): void {
    this.fingers.set(event.pointerId, this.position(event));
    this.rebase();
  }

  remove(pointerId: number): void {
    this.fingers.delete(pointerId);
    this.rebase();
  }

  move(event: PointerEvent): void {
    this.fingers.set(event.pointerId, this.position(event));
    const { camera } = this.host;
    const center = this.centerOfFingers();
    const spread = this.spreadAround(center);
    camera.panBy(center.x - this.center.x, center.y - this.center.y);
    if (this.spread > 0 && spread > 0) camera.zoomAt(center, (camera.zoom * spread) / this.spread);
    this.center = center;
    this.spread = spread;
    this.host.onChange();
  }

  /** Starts measuring again from where the fingers are, so a finger coming or going is no jump. */
  private rebase(): void {
    this.center = this.centerOfFingers();
    this.spread = this.spreadAround(this.center);
  }

  private position(event: PointerEvent): Point {
    return toCanvasPointer(event, this.host.canvas, this.host.camera).screen;
  }

  private centerOfFingers(): Point {
    let x = 0;
    let y = 0;
    for (const finger of this.fingers.values()) {
      x += finger.x;
      y += finger.y;
    }
    const count = Math.max(this.fingers.size, 1);
    return { x: x / count, y: y / count };
  }

  /** The fingers' average distance from their center: 0 with one finger, which only drags. */
  private spreadAround(center: Point): number {
    let total = 0;
    for (const finger of this.fingers.values()) {
      total += Math.hypot(finger.x - center.x, finger.y - center.y);
    }
    return total / Math.max(this.fingers.size, 1);
  }
}
