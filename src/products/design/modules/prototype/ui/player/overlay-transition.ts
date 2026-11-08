import type { PrototypeTransition } from "../../model";
import { FADE_IN, FADE_OUT, isInstant, play, settle, shift } from "./transition-frames";

/**
 * An overlay coming in as its interaction says: `dissolve` fades it in, any other animation moves
 * it in from the direction; its backdrop (left out on a swap, which keeps the one there) fades in
 * with it.
 */
export async function showOverlay(
  page: HTMLElement,
  backdrop: HTMLElement | null,
  t: PrototypeTransition,
): Promise<void> {
  if (isInstant(t)) return;
  const frames =
    t.animation === "dissolve"
      ? FADE_IN
      : [{ transform: shift(t.direction) }, { transform: "none" }];
  const animations = [play(page, frames, t)];
  if (backdrop) animations.push(play(backdrop, FADE_IN, t));
  try {
    await settle(animations);
  } finally {
    for (const animation of animations) animation.cancel();
  }
}

/**
 * An overlay going out the way it came in, reversed, quicker (200 ms at most) and easing in, then
 * `remove` takes it away while it's still on its last frame (so it never shows again first). Its
 * animations are cancelled whatever happens, so a failure never leaves an invisible overlay (and
 * its backdrop) over the screen.
 */
export async function hideOverlay(
  page: HTMLElement,
  backdrop: HTMLElement,
  t: PrototypeTransition,
  remove: () => void,
): Promise<void> {
  if (isInstant(t)) {
    await Promise.resolve();
    remove();
    return;
  }
  const how: PrototypeTransition = { ...t, duration: Math.min(t.duration, 200), easing: "ease-in" };
  const frames =
    t.animation === "dissolve"
      ? FADE_OUT
      : [{ transform: "none" }, { transform: shift(t.direction) }];
  const animations = [play(page, frames, how), play(backdrop, FADE_OUT, how)];
  try {
    await settle(animations);
    remove();
  } finally {
    for (const animation of animations) animation.cancel();
  }
}
