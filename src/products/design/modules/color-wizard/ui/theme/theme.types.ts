import type { CSSProperties, ReactNode } from "react";

import type { ThemeMode, WizardTheme } from "../..";

/** The part under the pointer: its token and mode, and which element it is. */
export interface ThemeHover {
  name: string;
  mode: ThemeMode;
  part: string;
}

export interface ThemePartsContextValue {
  theme: WizardTheme;
  hover: ThemeHover | null;
  setHover: (hover: ThemeHover | null) => void;
}

export interface ThemePartProps {
  name: string;
  mode: ThemeMode;
  as?: "div" | "span";
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

export interface ThemePaneProps {
  mode: ThemeMode;
}

export interface ThemeListCellProps {
  name: string;
  mode: ThemeMode;
}

export interface StripCellProps {
  hex: string;
  label: string;
  selected: boolean;
  /** Whether it passes every contrast check the token is in (none: no mark). */
  passes: boolean | null;
  title: string;
  onPick: () => void;
  wide?: boolean;
}
