import type * as React from "react";

export type IconButtonSize = "xs" | "sm" | "md" | "lg";

export interface IconButtonProps extends Omit<
  React.ComponentProps<"button">,
  "children" | "aria-label"
> {
  /** Its name: the aria label and the tooltip. */
  label: string;
  /** The icon. */
  children: React.ReactNode;
  /** A shortcut shown in the tooltip (already formatted, e.g. from `engine.keymap.label`). */
  shortcut?: string;
  /** A line under the label in the tooltip. */
  description?: string;
  /** Pressed (a toggle that's on, the active tool). */
  active?: boolean;
  /** `xs` (24px, panel headers and rows), `sm`/`md` (the density's controls), `lg` (toolbars). */
  size?: IconButtonSize;
  /** `ghost` (the default) or `outline`. */
  variant?: "ghost" | "outline";
  /** Where the tooltip opens; `false` shows none (the label stays the aria label). */
  tooltip?: "top" | "bottom" | "left" | "right" | false;
  /**
   * Hidden until its row is hovered or focused (a `group` or `group/row` ancestor), or its menu
   * is open: row actions like a ⋯ menu.
   */
  revealOnHover?: boolean;
}
