import type { MainMenuGroup } from "../../modules";
import type { MainMenuSection } from "./main-menu.types";

/**
 * Splits the main menu's groups (sorted) into sections: a group without a label is shown as its
 * items, and labelled groups next to each other become one section of submenus, so the menu
 * stays short however many modules add to it.
 */
export function mainMenuSections(groups: readonly MainMenuGroup[]): MainMenuSection[] {
  const sections: MainMenuSection[] = [];
  for (const group of groups) {
    const last = sections.at(-1);
    if (!group.label) sections.push({ kind: "items", id: group.id, items: group.items });
    else if (last?.kind === "submenus") last.groups = [...last.groups, group];
    else sections.push({ kind: "submenus", id: group.id, groups: [group] });
  }
  return sections;
}
