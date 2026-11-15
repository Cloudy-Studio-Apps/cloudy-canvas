/** When the user last pressed, dragged, scrolled or typed (`performance.now()`), 0 before. */
let last = 0;
let listening = false;

/**
 * When the user last gave input in the window: a press, a drag, the wheel, a key (moving the
 * pointer without a button doesn't count). Listens from the first call on.
 */
export function lastInputAt(): number {
  if (!listening && typeof window !== "undefined") {
    listening = true;
    const mark = () => (last = performance.now());
    const options = { capture: true, passive: true };
    window.addEventListener("pointerdown", mark, options);
    window.addEventListener("pointermove", (event) => event.buttons !== 0 && mark(), options);
    window.addEventListener("wheel", mark, options);
    window.addEventListener("keydown", mark, options);
  }
  return last;
}
