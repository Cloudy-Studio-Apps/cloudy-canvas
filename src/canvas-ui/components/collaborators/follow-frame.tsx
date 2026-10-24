import type { FollowFrameProps } from "./follow-frame.types";

/** The frame round the canvas while following someone, in their colour (as in Figma). */
export function FollowFrame({ color }: FollowFrameProps) {
  return <div className="absolute inset-0 border-2" style={{ borderColor: color }} aria-hidden />;
}
