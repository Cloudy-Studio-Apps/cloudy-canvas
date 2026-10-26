import type { CSSProperties, ReactNode } from "react";

import type { ThemeMode } from "../..";
import type { PreviewKind } from "../store";

/** What a sample design is drawn with: the Theme's colors in one mode, the palette and the fonts. */
export interface PreviewTokens {
  /** A token's color in the mode (the primary's when the theme lacks it). */
  t: (name: string) => string;
  /** The palette's own colors, for pictures and decoration (at least two). */
  deco: string[];
  /** A text style's CSS, its size capped at `max`. */
  text: (step: string, max?: number) => CSSProperties;
  body: string;
  /** A token mixed into the surface (a soft tint). */
  soft: (name: string, percent?: number) => string;
}

export interface SamplePreviewProps {
  kind: PreviewKind;
  mode: ThemeMode;
}

export interface PreviewProps {
  p: PreviewTokens;
}

export interface PreviewButtonProps {
  bg: string;
  fg: string;
  border?: string;
  children: ReactNode;
  small?: boolean;
}
