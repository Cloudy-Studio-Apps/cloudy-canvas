import type { PrototypeTransition } from "../../model";
import { FADE_IN, isInstant, play, settle, shift } from "./transition-frames";

/**
 * From one screen's layer to the next with a transition (Web Animations): `dissolve` fades the
 * new one in; `move-in` moves it in over the old, `move-out` moves the old one away off it; `push`
 * moves both; `slide-in` and `slide-out` move one and the other by 30%. `left` means the new
 * screen comes in from the right. The animations are cancelled and `oldEl` (a copy of the screen
 * shown before) is removed at the end, whatever happens.
 */
export async function runTransition(
  oldEl: HTMLElement | null,
  newEl: HTMLElement,
  t: PrototypeTransition,
): Promise<void> {
  const animations: Animation[] = [];
  const run = (el: HTMLElement, frames: Keyframe[]) => animations.push(play(el, frames, t));
  try {
    if (!oldEl || isInstant(t)) return;
    const into = [{ transform: shift(t.direction) }, { transform: "none" }];
    const away = [{ transform: "none" }, { transform: shift(t.direction, -1) }];
    switch (t.animation) {
      case "dissolve":
        run(newEl, FADE_IN);
        break;
      case "move-in":
        run(newEl, into);
        break;
      case "move-out":
        oldEl.style.zIndex = "1";
        run(oldEl, away);
        break;
      case "push":
        run(newEl, into);
        run(oldEl, away);
        break;
      case "slide-in":
        run(newEl, into);
        run(oldEl, [{ transform: "none" }, { transform: shift(t.direction, -0.3) }]);
        break;
      case "slide-out":
        oldEl.style.zIndex = "1";
        run(oldEl, away);
        run(newEl, [{ transform: shift(t.direction, 0.3) }, { transform: "none" }]);
        break;
      case "instant":
        break;
    }
    await settle(animations);
  } finally {
    for (const animation of animations) animation.cancel();
    oldEl?.remove();
  }
}
