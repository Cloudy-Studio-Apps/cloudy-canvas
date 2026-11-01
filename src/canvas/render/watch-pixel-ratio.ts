import type { Disposables } from "../utils";

/**
 * Calls `onChange` when the window's pixel ratio changes (moved to a screen with other scaling).
 * A query matches one ratio, so each change starts a new one.
 */
export function watchPixelRatio(disposables: Disposables, onChange: (ratio: number) => void): void {
  let stop = () => {};
  const watch = () => {
    const query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const changed = () => {
      watch();
      onChange(window.devicePixelRatio);
    };
    stop();
    query.addEventListener("change", changed, { once: true });
    stop = () => query.removeEventListener("change", changed);
  };
  watch();
  disposables.add(() => stop());
}
