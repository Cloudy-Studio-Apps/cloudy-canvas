/** A color as hue (0–360), saturation and value (0–1), what the color area and hue slider edit. */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

/** About a change from a drag: `done` is false while dragging, true on release (or a key press). */
export interface ColorChangeInfo {
  done: boolean;
}

export interface SaturationAreaProps {
  hsv: Hsv;
  /** New saturation and value, keeping the hue. */
  onChange: (hsv: Hsv, info: ColorChangeInfo) => void;
}

export interface ColorSliderProps {
  label: string;
  /** 0–1. */
  value: number;
  /** CSS background of the track (a gradient). */
  track: string;
  /** Draws a checkerboard under the track (for opacity). */
  checkered?: boolean;
  onChange: (value: number, info: ColorChangeInfo) => void;
}

export interface EyedropperButtonProps {
  /** Called with the picked `#rrggbb`. */
  onPick: (color: string) => void;
}

/** The browser's EyeDropper API (Chromium, WebView2), missing on WebKit. */
export interface EyeDropperApi {
  open(): Promise<{ sRGBHex: string }>;
}

export interface HexInputProps {
  /** `#rrggbb`. */
  color: string;
  /** Names the input for screen readers, e.g. "Fill hex". */
  label: string;
  /** Called with a valid `#rrggbb`. */
  onCommit: (color: string) => void;
  className?: string;
}

export interface PercentInputProps {
  /** 0–1, shown as 0–100. */
  value: number;
  label: string;
  /** Called with the new value, 0–1. */
  onCommit: (value: number) => void;
}

export interface ColorControlsProps {
  /** `#RRGGBB`. */
  color: string;
  /** 0–1; left out for a color without its own opacity (no opacity slider or field). */
  opacity?: number;
  onChange: (next: { color: string; opacity: number }, info: ColorChangeInfo) => void;
  /** Put before the controls' names for screen readers, e.g. "Stop ". */
  label?: string;
}

export interface ColorSwatchesProps {
  title: string;
  colors: readonly string[];
  onPick: (color: string) => void;
}
