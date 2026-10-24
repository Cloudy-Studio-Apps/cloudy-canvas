import type * as React from "react";

/** How a change came: `done` is false for the steps of a drag, true for its end and any other. */
export interface NumberChangeInfo {
  done: boolean;
}

export interface NumberInputProps {
  /** `null` when the selection's values differ: shows "Mixed" (it can't be scrubbed then). */
  value: number | null;
  onChange: (value: number, info: NumberChangeInfo) => void;
  /** Its name: the aria label and the tooltip. */
  label: string;
  /** Shown before the value (a letter, an icon). Dragging it sideways changes the value. */
  prefix?: React.ReactNode;
  /** Shown after the value (a unit, "%"); it scrubs like the prefix. */
  suffix?: string;
  min?: number;
  max?: number;
  /** What Up/Down add (Shift: ten times), in shown units (a percent with `factor: 100`). Default 1. */
  step?: number;
  /** What a pixel of dragging adds (Shift: ten times), in shown units. Default `step`. */
  scrubStep?: number;
  /** Shown and typed as this many times the value (a 0–1 value as a percentage: 100). */
  factor?: number;
  /** Decimals it's rounded to, as shown. Default 2. */
  decimals?: number;
  /** A drag of the prefix starts and ends: hosts join its steps into one undo step. */
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
  disabled?: boolean;
  className?: string;
}

/** What `useScrub` needs: the value, its limits and where the steps go. */
export interface ScrubOptions {
  value: number | null;
  min: number;
  max: number;
  scrubStep: number;
  factor: number;
  decimals: number;
  disabled?: boolean;
  onChange: (value: number, info: NumberChangeInfo) => void;
  onStart?: () => void;
  onEnd?: () => void;
  /** A press on the prefix that didn't drag: focus the input. */
  onClick: () => void;
}

/** The prefix's pointer handlers, and whether a drag is going on. */
export interface ScrubHandlers {
  scrubbing: boolean;
  handlers: Pick<
    React.HTMLAttributes<HTMLElement>,
    "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel"
  >;
}
