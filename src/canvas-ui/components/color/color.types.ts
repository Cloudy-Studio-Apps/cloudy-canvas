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
