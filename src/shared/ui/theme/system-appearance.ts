const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Whether the OS is in dark mode now. */
export function systemIsDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

/** Calls `listener` when the OS switches between light and dark. */
export function onSystemAppearance(listener: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
