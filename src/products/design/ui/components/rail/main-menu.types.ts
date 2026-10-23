import type { MainMenuGroup, MainMenuItem } from "../../modules";

/**
 * A part of the main menu between separators: a group's items shown in the menu, or a run of
 * labelled groups shown as submenus (File, Edit, …).
 */
export type MainMenuSection =
  | { kind: "items"; id: string; items: readonly MainMenuItem[] }
  | { kind: "submenus"; id: string; groups: readonly MainMenuGroup[] };

export interface MainMenuEntryProps {
  item: MainMenuItem;
  /** Runs the item: its command, or its action. */
  onPick: (item: MainMenuItem) => void;
}

export interface MainMenuSubmenuProps {
  group: MainMenuGroup;
  onPick: (item: MainMenuItem) => void;
}
