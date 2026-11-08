import { useEffect, type RefObject } from "react";

/** How fast the wheel zooms: the zoom is multiplied by e^(-delta × this). */
const WHEEL_ZOOM_RATE = 0.0015;

/**
 * The wheel over `target` zooms the model (`onZoom` gets the factor to multiply it by) and never
 * reaches the canvas, which would zoom itself. Not passive, so it can be prevented.
 */
export function useWheelZoom(
  target: RefObject<HTMLElement | null>,
  onZoom: (factor: number) => void,
): void {
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      // Lines and pages count as about 16 and 400 pixels.
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
      onZoom(Math.exp(-event.deltaY * unit * WHEEL_ZOOM_RATE));
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [target, onZoom]);
}
