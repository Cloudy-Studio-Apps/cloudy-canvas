import type { ReactNode } from "react";

import type { ErPaletteIconProps } from "./er-palette.types";

/** The Chen symbol of a palette item, drawn in the current text color. */
export function ErPaletteIcon({ id }: ErPaletteIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
      aria-hidden
      className="size-5"
    >
      {SYMBOLS[id]}
    </svg>
  );
}

const SYMBOLS: Record<ErPaletteIconProps["id"], ReactNode> = {
  entity: <rect x="3" y="7" width="18" height="10" />,
  "weak-entity": (
    <>
      <rect x="2.5" y="6.5" width="19" height="11" />
      <rect x="5" y="9" width="14" height="6" />
    </>
  ),
  relation: <path d="M12 5 L21 12 L12 19 L3 12 Z" />,
  associative: (
    <>
      <rect x="2.5" y="5" width="19" height="14" />
      <path d="M12 6.5 L19.5 12 L12 17.5 L4.5 12 Z" />
    </>
  ),
  attribute: <ellipse cx="12" cy="12" rx="9" ry="5.5" />,
  "key-attribute": (
    <>
      <ellipse cx="12" cy="11" rx="9" ry="5.5" />
      <path d="M8 12.5 H16" />
    </>
  ),
  isa: (
    <>
      <path d="M12 4 V8" />
      <path d="M12 8 L19 18 H5 Z" />
    </>
  ),
  union: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M9.5 9 V13 A2.5 2.5 0 0 0 14.5 13 V9" />
    </>
  ),
  aggregate: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" strokeDasharray="2.5 2" />
      <path d="M12 8.5 L17 12 L12 15.5 L7 12 Z" />
    </>
  ),
  constraint: (
    <>
      <path d="M6 7 L6 17" />
      <path d="M18 7 L18 17" />
      <path d="M6 12 H18" strokeDasharray="2.5 2" />
    </>
  ),
};
