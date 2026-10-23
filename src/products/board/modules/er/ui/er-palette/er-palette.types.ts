import type { PointerEvent as ReactPointerEvent } from "react";

import type { ErDiagram, ErPaletteItemId } from "@board";

export interface ErPaletteItem {
  id: ErPaletteItemId;
  label: string;
  description: string;
}

export interface ErPaletteButtonProps {
  item: ErPaletteItem;
  /** The shown diagram, or `undefined` when none is (an entity then starts one). */
  diagram: ErDiagram | undefined;
  /** What a click adds right now ("Attribute of Customer"), or why it can't. */
  clickLabel: string;
  clickDisabled: boolean;
  /** The diagram's standard forbids it: disabled, `clickLabel` says why. */
  blocked?: boolean;
  /** Its key in the ER mode, shown in the tooltip. */
  shortcut?: string | undefined;
  onClick: () => void;
}

export interface ErPaletteIconProps {
  id: ErPaletteItemId;
}

/** The chip following the pointer while an item is dragged. */
export interface ErDragGhost {
  x: number;
  y: number;
  label: string;
  ok: boolean;
}

export interface ErDragGhostProps {
  item: ErPaletteItemId;
  ghost: ErDragGhost;
}

export interface PaletteDragOptions {
  item: ErPaletteItemId;
  diagram: ErDiagram | undefined;
  /** A press released without dragging. */
  onClick: () => void;
}

export interface PaletteDrag {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  ghost: ErDragGhost | null;
}
