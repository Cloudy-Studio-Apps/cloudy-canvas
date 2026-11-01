import type * as React from "react";

import type { ErConstraintRule } from "../../../constraint/constraint.types";

const SMALL = {
  left: <path d="M9 7 17 15 9 23 1 15Z" />,
  right: <path d="M31 7 39 15 31 23 23 15Z" />,
  top: <path d="M29 2 37 7 29 12 21 7Z" />,
  bottom: <path d="M29 18 37 23 29 28 21 23Z" />,
  fan: <path d="M2 15H10M10 15 24 7M10 15 24 23" />,
};

/** Each rule, as a small drawing. */
export const CONSTRAINT_GLYPHS: Record<ErConstraintRule, React.ReactNode> = {
  exclusive: (
    <>
      {SMALL.fan}
      {SMALL.top}
      {SMALL.bottom}
      <path d="M15 9Q19 15 15 21" />
    </>
  ),
  inclusive: (
    <>
      {SMALL.fan}
      {SMALL.top}
      {SMALL.bottom}
      <path d="M29 18V12" strokeDasharray="2 2" />
    </>
  ),
  exclusion: (
    <>
      {SMALL.left}
      {SMALL.right}
      <path d="M17 15H23" />
    </>
  ),
  inclusion: (
    <>
      {SMALL.left}
      {SMALL.right}
      <path d="M23 15H18M21 12l-3 3 3 3" />
    </>
  ),
};
