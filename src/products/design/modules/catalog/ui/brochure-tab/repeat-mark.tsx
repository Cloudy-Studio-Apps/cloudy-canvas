import { Database, Repeat } from "lucide-react";

import type { RepeatMarkProps } from "./repeat-marks.types";

/**
 * A row's repeat mark in the page list: a template section or page that repeats ("Repeats for each
 * row of products"), or a copy a repeat made (the data mark, "Copy of …").
 */
export function RepeatMark({ kind, label }: RepeatMarkProps) {
  return (
    <span
      role="img"
      title={label}
      aria-label={label}
      className="flex shrink-0 text-primary [&_svg]:size-3"
    >
      {kind === "template" ? <Repeat /> : <Database />}
    </span>
  );
}
