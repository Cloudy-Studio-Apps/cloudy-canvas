import type { ExtensionIcon } from "./editor-points.types";

/** A button of a mode's toolbar that picks a tool; label, icon and description default to its tool entry's. */
export interface ModeToolbarToolEntry {
  tool: string;
  label?: string;
  description?: string;
  icon?: ExtensionIcon;
}

/** A button that runs a host command (`engine.runHostAction`); its shortcut is the command's. */
export interface ModeToolbarCommandEntry {
  command: string;
  label: string;
  description?: string;
  icon: ExtensionIcon;
  disabled?: boolean;
  /** Shown active while this tool is on (e.g. the tool the command switches to). */
  activeWhen?: { tool: string };
  /** A count drawn over the icon (left out or 0: none). */
  badge?: number;
  /** Drawn as a primary button with its label next to its icon: the mode's main action. */
  primary?: boolean;
}

/** A button that calls `run`. */
export interface ModeToolbarRunEntry {
  run: () => void;
  label: string;
  description?: string;
  icon: ExtensionIcon;
  disabled?: boolean;
  active?: boolean;
  /** A count drawn over the icon (left out or 0: none). */
  badge?: number;
}

/** One item of a mode's toolbar: a button, or a divider between groups. */
export type ModeToolbarEntry =
  "divider" | ModeToolbarToolEntry | ModeToolbarCommandEntry | ModeToolbarRunEntry;

export interface ModeToolbarProps {
  items: readonly ModeToolbarEntry[];
  /** Shown first with its icon, then a divider; without it, the toolbar starts with the items. */
  title?: { label: string; icon: ExtensionIcon };
  /** The toolbar's accessible name (default: the title's label). */
  label?: string;
  /** What Done does (default: leave the mode, `useEditorMode().leave`). */
  onDone?: () => void;
}

/** What an item of a mode's toolbar shows and does (`useModeToolbarItem`). */
export interface ModeToolbarItemView {
  label: string;
  description: string | undefined;
  shortcut: string | undefined;
  icon: ExtensionIcon;
  badge: number | undefined;
  active: boolean | undefined;
  disabled: boolean | undefined;
  /** A primary button with its label shown (a command's `primary`). */
  primary: boolean;
  run: () => void;
}

export interface ModeToolbarItemProps {
  item: Exclude<ModeToolbarEntry, "divider">;
}

export interface BadgedIconProps {
  icon: ExtensionIcon;
  badge: number | undefined;
}
