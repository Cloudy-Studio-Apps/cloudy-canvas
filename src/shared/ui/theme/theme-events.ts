const listeners = new Set<() => void>();

/**
 * Calls `listener` once a new theme's CSS is in place (after a switch, the OS changing in
 * `system` mode, the density), for code that reads tokens outside React: the canvas, the rulers.
 */
export function onThemeChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Tells the listeners; only the app's theme sync calls it. */
export function notifyThemeChange(): void {
  for (const listener of listeners) listener();
}
