import type { Ref } from "react";

import type { Size } from "@canvas";
import type { BookLayout, BookSide, BrochurePage, FrameElement, SidePart } from "@design";

export interface PreviewPageProps {
  frame: FrameElement;
  /** All of the frame, or one half of a spread frame. */
  part: SidePart;
  /** The page's size on screen, in CSS pixels. */
  width: number;
  height: number;
}

export interface SidePictureProps {
  /** A page, half a spread frame or a blank page; `null` shows nothing. */
  side: BookSide | null;
  width: number;
  height: number;
}

/** Which side lies on each side of the open booklet (the single layout uses `right`). */
export interface BookSlots {
  left: BookSide | null;
  right: BookSide | null;
}

/** A page turning round its hinge: where it starts, what's on each face and how far it turns. */
export interface TurningSheetLayout {
  /** The side it starts on (`single`: the one page of the single layout). */
  over: "left" | "right" | "single";
  /** The edge it turns round. */
  hinge: "left" | "right";
  front: BookSide | null;
  back: BookSide | null;
  /** Degrees round the hinge at the start and the end. */
  from: number;
  to: number;
}

/** What the 3D booklet shows: the sides lying open and, mid-turn, the sheet turning. */
export interface BookView {
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

/** How big the preview draws: CSS pixels per world unit, and the stage's width (CSS pixels). */
export interface StageSize {
  scale: number;
  /** One brochure page on screen. */
  page: { width: number; height: number };
  stageWidth: number;
}

export interface BookSpreadProps {
  view: BookView;
  /** One page at a time (the single layout). */
  single: boolean;
  size: StageSize;
  /** The brochure's page, in world units (a blank side's size). */
  pageSize: Size;
  turnId: number | null;
}

export interface BookPageProps {
  side: BookSide | null;
  position: "left" | "right" | "single";
  /** Where it starts across the stage, and its size (CSS pixels). */
  left: number;
  width: number;
  height: number;
}

export interface TurningSheetProps {
  sheet: TurningSheetLayout;
  left: number;
  width: number;
  height: number;
}

export interface SheetFaceProps {
  side: BookSide | null;
  width: number;
  height: number;
  /** The back face, turned to face the other way. */
  back?: boolean;
  /** The shade that darkens the face as it turns. */
  shadeRef: Ref<HTMLSpanElement>;
}

export interface FlatSpreadProps {
  sides: readonly BookSide[];
  pageSize: Size;
}

export interface Preview3dToggleProps {
  className?: string;
}

export interface PreviewStageProps {
  layout: BookLayout;
  /** One page at a time (the single layout), else facing pages. */
  single: boolean;
  /** The spread shown, by position among the layout's spreads. */
  current: number;
  pageSize: Size;
}

export interface PreviewStripProps {
  pages: readonly BrochurePage[];
  /** The pages (by slot id) on the spread shown. */
  shown: ReadonlySet<string>;
  onPick: (slotId: string) => void;
}
