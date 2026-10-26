import type { ReactNode } from "react";

import type { HarmonyId } from "../..";
import type { HarmonyIconProps } from "./colors.types";

const SHAPES: Record<HarmonyId, ReactNode> = {
  analogous: <path d="M14 14 14 3M14 14 7 5M14 14 21 5" />,
  monochromatic: (
    <>
      <path d="M14 14 14 3" />
      <circle cx="14" cy="8" r="1.5" />
    </>
  ),
  complementary: <path d="M14 3v22" />,
  split: <path d="M14 14 14 3M14 14 9 24M14 14 19 24" />,
  triad: <path d="M14 3 23.5 19.5H4.5Z" />,
  square: <path d="M14 3 25 14 14 25 3 14Z" />,
  compound: <path d="M14 3 19.5 4.5 14 25 8.5 23.5Z" />,
  shades: (
    <>
      <circle cx="14" cy="8" r="1.5" />
      <circle cx="14" cy="14" r="1.5" />
      <circle cx="14" cy="20" r="1.5" />
    </>
  ),
  custom: (
    <>
      <circle cx="9" cy="9" r="1.5" />
      <circle cx="19" cy="11" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </>
  ),
};

/** A harmony as a little wheel with its spokes. */
export function HarmonyIcon({ harmony }: HarmonyIconProps) {
  return (
    <svg
      viewBox="0 0 28 28"
      className="size-7 fill-none stroke-current"
      strokeWidth={1.5}
      aria-hidden
    >
      <circle cx="14" cy="14" r="11" />
      {SHAPES[harmony]}
    </svg>
  );
}
