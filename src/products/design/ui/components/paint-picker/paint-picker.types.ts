import type { ColorChangeInfo } from "@canvas-ui";
import type { ImagePaint, Paint, SolidPaint } from "@design";

/** Reports a new paint; `done` is false for the in-between steps of a drag. */
export type PaintChange = (paint: Paint, info: ColorChangeInfo) => void;

export interface PaintPickerProps {
  paint: Paint;
  onChange: PaintChange;
  onClose: () => void;
  /** Whether the paint can be an image (fills can, strokes can't yet). */
  allowImage: boolean;
}

export interface SolidEditorProps {
  paint: SolidPaint;
  onChange: (paint: SolidPaint, info: ColorChangeInfo) => void;
}

export interface ImageEditorProps {
  /** `null` until an image is chosen. */
  paint: ImagePaint | null;
  onChange: (paint: ImagePaint) => void;
}

/** A tab of the picker: a kind of paint. */
export interface PaintTab {
  id: "solid" | "linear" | "radial" | "angular" | "diamond" | "image" | "pattern";
  label: string;
  /** Whether it can be picked yet. */
  ready: boolean;
}

export interface PaintTabsProps {
  active: PaintTab["id"];
  onPick: (tab: PaintTab["id"]) => void;
  allowImage: boolean;
}

export interface ColorSwatchesProps {
  title: string;
  colors: readonly string[];
  onPick: (color: string) => void;
}
