import { useEffect, useMemo, useState } from "react";

import type { ShareGuest } from "@canvas";
import type { HeldGuest } from "./hold-guest.types";

/** A session nothing came to hold (its render was thrown away) is left after this long. */
const UNHELD_MS = 2_000;

/** The one live session joined as a guest; it outlives remounts of what shows it. */
let current: HeldGuest | null = null;

/**
 * The guest session for `key` (a session's ticket), joined with `start` the first time and left
 * once nothing holds it anymore, until it's handed over to a file tab (`handOverGuest`). Rendering
 * again or remounting (StrictMode, a route re-render) keeps the same session.
 */
export function useHeldGuest(key: string, start: () => ShareGuest): ShareGuest {
  const [initialStart] = useState(() => start);
  const held = useMemo(() => acquire(key, initialStart), [key, initialStart]);

  useEffect(() => hold(held), [held]);

  return held.guest;
}

/** The session for `key`: the current one, or a new one (leaving any other). */
function acquire(key: string, start: () => ShareGuest): HeldGuest {
  if (current && current.key === key && current.guest.state.get().status !== "closed") {
    return current;
  }
  current?.guest.leave();
  const held: HeldGuest = { key, guest: start(), holders: 0, handedOver: false };
  current = held;
  setTimeout(() => leaveIfUnheld(held), UNHELD_MS);
  return held;
}

/**
 * Holds the session while mounted; letting go leaves it after this task unless something holds
 * it again.
 */
function hold(held: HeldGuest): () => void {
  held.holders++;
  return () => {
    held.holders--;
    setTimeout(() => leaveIfUnheld(held), 0);
  };
}

/**
 * Gives the session to the file tab that shows it: the tab leaves it when it closes, and joining
 * the same link again starts a new session.
 */
export function handOverGuest(guest: ShareGuest): void {
  if (current?.guest !== guest) return;
  current.handedOver = true;
  current = null;
}

function leaveIfUnheld(held: HeldGuest): void {
  if (held.holders > 0 || held.handedOver) return;
  held.guest.leave();
  if (current === held) current = null;
}
