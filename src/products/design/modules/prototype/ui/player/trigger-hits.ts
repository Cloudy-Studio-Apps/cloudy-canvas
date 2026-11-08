import { rectContainsPoint, type Point } from "@canvas";

import type { OverlayEntry, PrototypeTrigger } from "../../model";
import type { PlayerSurface, PlayerSurfaces, PlayerTarget } from "./player-surfaces.types";
import type { TargetHit } from "./trigger-hits.types";

/** What takes input: the top overlay, else the screen under the overlays. */
export function activeSurface(surfaces: PlayerSurfaces): PlayerSurface | null {
  return surfaces.overlays.at(-1) ?? surfaces.base;
}

/** The targets of a surface under a point (device units), topmost first, the screen last. */
export function targetsAt(surface: PlayerSurface, p: Point): PlayerTarget[] {
  return surface.targets.filter((target) => rectContainsPoint(target.rect, p));
}

/** The first of these targets with an interaction of `trigger` (the nearest, when they're hits). */
export function firstWith(
  targets: readonly PlayerTarget[],
  trigger: PrototypeTrigger,
): TargetHit | null {
  for (const target of targets) {
    const ix = target.interactions.find((candidate) => candidate.trigger === trigger);
    if (ix) return { target, ix };
  }
  return null;
}

/** Whether a point is on the overlay `entry` shows. */
export function onOverlay(surfaces: PlayerSurfaces, entry: OverlayEntry, p: Point): boolean {
  const surface = surfaces.overlays.find((candidate) => candidate.overlay === entry);
  return surface !== undefined && rectContainsPoint(surface.rect, p);
}
