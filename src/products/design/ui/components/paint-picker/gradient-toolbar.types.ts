import type { ColorChangeInfo } from "@canvas-ui";
import type { GradientPaint } from "@design";

export interface GradientToolbarProps {
  paint: GradientPaint;
  onChange: (paint: GradientPaint, info: ColorChangeInfo) => void;
  /** Adds a stop halfway along the widest gap. */
  onAddStop: () => void;
  /** Copies the gradient as CSS. */
  onCopy: () => void;
}
