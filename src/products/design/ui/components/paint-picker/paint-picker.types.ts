import type { Gradient, Size } from "@canvas";
import type { ColorChangeInfo } from "@canvas-ui";
import type { GradientPaint, ImagePaint, Paint, SolidPaint } from "@design";

/** Reports a new paint; `done` is false for the in-between steps of a drag. */
export type PaintChange = (paint: Paint, info: ColorChangeInfo) => void;

export interface PaintPickerProps {
  paint: Paint;
  onChange: PaintChange;
  onClose: () => void;
  /** Whether the paint can be an image (fills can, strokes can't yet). */
  allowImage: boolean;
  /** The edited layer's size, for copying a gradient as CSS (a square when unknown). */
  size?: Size;
}

export interface ColorControlsProps {
  /** `#RRGGBB`. */
  color: string;
  /** 0–1. */
  opacity: number;
  onChange: (next: { color: string; opacity: number }, info: ColorChangeInfo) => void;
  /** Put before the controls' names for screen readers, e.g. "Stop ". */
  label?: string;
}

export interface SolidEditorProps {
  paint: SolidPaint;
  onChange: (paint: SolidPaint, info: ColorChangeInfo) => void;
}

export interface ImageEditorProps {
  /** `null` until an image is chosen. */
  paint: ImagePaint | null;
  onChange: (paint: ImagePaint) => void;
  /** The edited layer's size, for starting and turning crops (a square when unknown). */
  size?: Size;
}

export interface GradientEditorProps {
  paint: GradientPaint;
  onChange: (paint: GradientPaint, info: ColorChangeInfo) => void;
  /** The edited layer's size, for previews and turning (a square when unknown). */
  size?: Size;
}

export interface GradientStopBarProps {
  paint: GradientPaint;
  /** The selected stop's index in `paint.stops`. */
  selected: number;
  onSelect: (index: number) => void;
  onChange: (paint: GradientPaint, info: ColorChangeInfo) => void;
}

export interface GradientStopRowProps {
  paint: GradientPaint;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onChange: (paint: GradientPaint, info: ColorChangeInfo) => void;
}

export interface GradientSwatchesProps {
  title: string;
  gradients: readonly Gradient[];
  onPick: (gradient: Gradient) => void;
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
