/** Whether the system asks for less motion (entrances and camera glides are skipped then). */
export function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
