import type * as React from "react";

import type { ResolvedTheme, ThemeDefinition } from "@shared/core";

/** The theme the app shows now. */
export interface ActiveTheme {
  /** What the store asked for. */
  requestedId: string;
  /** What's shown: the requested theme, or the fallback when it isn't installed. */
  definition: ThemeDefinition;
  resolved: ResolvedTheme;
  /** The requested theme isn't installed (its plugin was removed or turned off). */
  missing: boolean;
}

export interface ThemeMenuProps {
  /** The menu's button. */
  trigger: React.ReactNode;
  align?: "start" | "center" | "end";
  /** Opens Settings › Appearance; the item is left out without it. */
  onOpenSettings?: () => void;
}

export interface ThemeDotProps {
  color: string;
  ring: string;
}
