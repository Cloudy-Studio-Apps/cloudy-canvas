import type React from "react";

import type { DesignNode, LayerDestination, LayerTree } from "../../../core";

import type { LayerRowItem } from "../visible-rows.types";

/** The list's geometry, in pixels: row height, indent per level and the first level's indent. */
export interface LayerListMetrics {
  rowHeight: number;
  indent: number;
  baseIndent: number;
}

export interface LayerDropInput {
  rows: readonly LayerRowItem[];
  tree: LayerTree;
  /** The layers being dragged. */
  moving: ReadonlySet<string>;
  /** The pointer in the list's content (scrolled), in pixels. */
  x: number;
  y: number;
  metrics: LayerListMetrics;
  /** Whether a layer holds others (a frame, section, group or boolean). */
  holds: (node: DesignNode) => boolean;
  /** Whether the dragged layers may go there (`moveIntoProblem`). */
  allowed: (destination: LayerDestination) => boolean;
}

/** Where a drop lands and how the list shows it: a line between rows, or a row outlined. */
export interface LayerDrop {
  destination: LayerDestination;
  /** The line: above row `boundary` (rows.length: under the last), indented to `depth`. */
  line: { boundary: number; depth: number } | null;
  /** The row the layers go into, outlined. */
  inside: string | null;
}

/** A drag in the layers list: what moves, its name for the ghost, the pointer and the drop. */
export interface LayerDragState {
  moving: ReadonlySet<string>;
  label: string;
  /** The pointer on screen (client coordinates). */
  pointer: { x: number; y: number };
  drop: LayerDrop | null;
}

export interface LayerDragOptions {
  rows: readonly LayerRowItem[];
  tree: LayerTree;
  /** The list (its content box: rows start at its top-left). */
  list: React.RefObject<HTMLElement | null>;
  /** The element that scrolls the list. */
  scroll: React.RefObject<HTMLElement | null>;
  metrics: LayerListMetrics;
  /** Opens a collapsed layer hovered while dragging into it. */
  expand: (id: string) => void;
  /** Off while searching (the list is flat). */
  enabled: boolean;
}
