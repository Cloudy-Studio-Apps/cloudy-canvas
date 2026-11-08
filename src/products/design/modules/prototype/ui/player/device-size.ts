import type { CanvasDocument, Size } from "@canvas";

import { currentScreen, isScreen, type PlayerState } from "../../model";

/**
 * The device's screen size, in world units: the size of the screen the session began at, so it
 * stays as screens change (a bigger screen is clipped: screens don't scroll yet). The shown screen's
 * when that one is gone; `null` when neither is there.
 */
export function deviceSize(doc: CanvasDocument, state: PlayerState): Size | null {
  for (const id of [state.stack[0]?.screen, currentScreen(state)]) {
    const screen = id ? doc.get(id) : undefined;
    if (isScreen(screen)) return { w: screen.w, h: screen.h };
  }
  return null;
}
