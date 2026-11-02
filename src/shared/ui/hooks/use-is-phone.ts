import { useSyncExternalStore } from "react";

/** Narrower than Tailwind's `sm`, so what this decides and `max-sm:` classes agree. */
const QUERY = "(width < 40rem)";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Whether the window is phone-sized, kept up to date when it turns or resizes. */
export function useIsPhone(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches);
}
