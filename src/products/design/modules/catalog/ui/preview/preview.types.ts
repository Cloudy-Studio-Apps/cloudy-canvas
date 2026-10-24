import type { Ref } from "react";

import type { BrochurePage, FrameElement } from "@design";

export interface PreviewPageProps {
  frame: FrameElement;
  /** The page's width on screen, in CSS pixels. */
  width: number;
  /** Its height; by default the frame's proportions (with one, the picture fits inside it). */
  height?: number;
}

/** Which page (by position in the brochure) lies on each side of the open booklet. */
export interface BookSlots {
  left: number | null;
  right: number | null;
}

/** A page turning over the spine: where it starts, what's on each face and how far it turns. */
export interface TurningSheetLayout {
  /** The side it starts on (`single`: the one page of a booklet without facing pages). */
  over: "left" | "right" | "single";
  /** The edge it turns round. */
  hinge: "left" | "right";
  front: number | null;
  back: number | null;
  /** Degrees round the hinge at the start and the end. */
  from: number;
  to: number;
}

/** What the 3D booklet shows: the pages lying open and, mid-turn, the sheet turning. */
export interface BookLayout {
  base: BookSlots;
  sheet: TurningSheetLayout | null;
}

/** A spread change being animated (`usePageTurn`). */
export interface PageTurn {
  /** Spreads, by position among them. */
  from: number;
  to: number;
  /** Tells turns apart, so a new one starts its animation afresh. */
  id: number;
}

export interface PageTurnState {
  spread: number;
  turn: PageTurn | null;
  count: number;
}

export interface BookSpreadProps {
  layout: BookLayout;
  /** One page at a time (no facing pages). */
  single: boolean;
  /** A page's frame by its position in the brochure. */
  frameAt: (position: number | null) => FrameElement | undefined;
  /** Each page's size on screen. */
  width: number;
  height: number;
  turnId: number | null;
}

export interface BookPageProps {
  frame: FrameElement | undefined;
  side: "left" | "right" | "single";
  width: number;
  height: number;
}

export interface TurningSheetProps {
  sheet: TurningSheetLayout;
  front: FrameElement | undefined;
  back: FrameElement | undefined;
  width: number;
  height: number;
}

export interface SheetFaceProps {
  frame: FrameElement | undefined;
  width: number;
  height: number;
  /** The back face, turned to face the other way. */
  back?: boolean;
  /** The shade that darkens the face as it turns. */
  shadeRef: Ref<HTMLSpanElement>;
}

export interface FlatSpreadProps {
  frames: readonly FrameElement[];
  width: number;
}

export interface Preview3dToggleProps {
  className?: string;
}

/** A page's size on screen, in CSS pixels. */
export interface PreviewSize {
  width: number;
  height: number;
}

export interface PreviewStageProps {
  pages: readonly BrochurePage[];
  spreads: readonly (readonly number[])[];
  /** The spread shown, by position among them. */
  current: number;
  facing: boolean;
}

export interface PreviewStripProps {
  pages: readonly BrochurePage[];
  /** The positions of the pages shown. */
  shown: readonly number[];
  onPick: (position: number) => void;
}
