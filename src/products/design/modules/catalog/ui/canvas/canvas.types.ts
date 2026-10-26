import type { Rect } from "@canvas";
import type { BrochurePage } from "../../model/brochure-pages.types";
import type { FrameElement } from "../../../frame";

/** Where a frame shows on screen, relative to the canvas. */
export type ScreenRect = Rect;

export interface PageBadgeProps {
  rect: ScreenRect;
  /** "4", or "9B" for an option that isn't printed. */
  label: string;
  printed: boolean;
}

export interface AddFrameBarProps {
  rect: ScreenRect;
  frame: FrameElement;
  /** The page it can become an option of (the selected one, else the last). */
  target: BrochurePage | undefined;
}

export interface PickCheckboxProps {
  rect: ScreenRect;
  ticked: boolean;
}

export interface MarginGuideProps {
  rect: ScreenRect;
}
