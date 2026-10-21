import type { Debounced } from "./debounce.types";

/** Calls `fn` once `delay` ms have passed without another call. */
export function debounce(fn: () => void, delay: number): Debounced {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = () => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}
