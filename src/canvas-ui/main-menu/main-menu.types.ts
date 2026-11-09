import type { CanvasEngine } from "@canvas";
import type { ExtensionIcon } from "../modules";

/** What a main menu item can reach when it's picked. */
export interface MainMenuContext<E extends CanvasEngine = CanvasEngine> {
  engine: E;
  /** Goes to an app route, e.g. `"/"` (Home). */
  navigate(to: string): void;
}

/** An item of the main menu: an engine command (named and bound by the keymap) or an action. */
export type MainMenuItem<E extends CanvasEngine = CanvasEngine> = {
  icon?: ExtensionIcon;
  /** Shows the item as a checkbox, ticked while this is true (e.g. whether the rulers show). */
  checked?(engine: E): boolean;
} & (
  { command: string; label?: string } | { label: string; run(context: MainMenuContext<E>): void }
);

/** Items of the main menu between separators, with an optional heading. */
export interface MainMenuGroup<E extends CanvasEngine = CanvasEngine> {
  id: string;
  /** Position in the menu, lowest first. Built-ins are spaced by 10. */
  order: number;
  label?: string;
  items: readonly MainMenuItem<E>[];
}

/**
 * A part of the main menu between separators: a group's items shown in the menu, or a run of
 * labelled groups shown as submenus (File, Edit, …).
 */
export type MainMenuSection =
  | { kind: "items"; id: string; items: readonly MainMenuItem[] }
  | { kind: "submenus"; id: string; groups: readonly MainMenuGroup[] };

export interface MainMenuEntryProps {
  item: MainMenuItem;
  engine: CanvasEngine;
  /** Runs the item: its command, or its action. */
  onPick: (item: MainMenuItem) => void;
}

export interface MainMenuSubmenuProps {
  group: MainMenuGroup;
  engine: CanvasEngine;
  onPick: (item: MainMenuItem) => void;
}

export interface MainMenuSectionsProps {
  /** The groups, in any order (sorted here). */
  groups: readonly MainMenuGroup[];
  engine: CanvasEngine;
  /** Goes to an app route (an action item's `navigate`). */
  navigate(to: string): void;
}
