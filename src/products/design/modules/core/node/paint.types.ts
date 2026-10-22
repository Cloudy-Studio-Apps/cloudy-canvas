/** A flat color. */
export interface SolidPaint {
  type: "solid";
  /** `#rrggbb`. */
  color: string;
  /** 0–1. */
  opacity: number;
  visible: boolean;
}

/** How a node's fill or stroke is painted. Only solid colors so far; gradients and images later. */
export type Paint = SolidPaint;
