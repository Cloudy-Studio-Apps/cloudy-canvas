import type * as React from "react";

export interface SwatchProps extends Omit<React.ComponentProps<"span">, "color"> {
  /** Any CSS color; transparent ones show over a checkerboard. */
  color: string;
  size?: "xs" | "sm" | "md";
  /** Round (a variable, a color dot) instead of square. */
  round?: boolean;
}
