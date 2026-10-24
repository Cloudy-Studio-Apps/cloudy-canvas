import { Bot, HardDrive, Info, Keyboard, Palette, Puzzle, Users } from "lucide-react";

import { AboutPage } from "./sections/about-page";
import { AppearanceSection } from "./sections/appearance";
import { AgentsSection } from "./sections/agents-section";
import { CollaborationSection } from "./sections/collaboration";
import { FilesSection } from "./sections/files-section";
import { PluginsSection } from "./sections/plugins";
import { ShortcutsSection } from "./sections/shortcuts-section";
import type { SettingsGroup, SettingsSectionEntry } from "./settings-sections.types";

export const SETTINGS_GROUPS: readonly SettingsGroup[] = [
  { id: "preferences", label: "Preferences" },
  { id: "extensions", label: "Extensions" },
  { id: "help", label: "Help" },
];

/** In nav order; the first is what `/settings` shows. */
export const SETTINGS_SECTIONS: readonly SettingsSectionEntry[] = [
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    group: "preferences",
    component: AppearanceSection,
  },
  {
    id: "files",
    label: "Files & storage",
    icon: HardDrive,
    group: "preferences",
    component: FilesSection,
  },
  {
    id: "collaboration",
    label: "Collaboration",
    icon: Users,
    group: "preferences",
    component: CollaborationSection,
  },
  { id: "agents", label: "Agents (MCP)", icon: Bot, group: "extensions", component: AgentsSection },
  { id: "plugins", label: "Plugins", icon: Puzzle, group: "extensions", component: PluginsSection },
  {
    id: "shortcuts",
    label: "Keyboard shortcuts",
    icon: Keyboard,
    group: "help",
    component: ShortcutsSection,
  },
  { id: "about", label: "About", icon: Info, group: "help", component: AboutPage },
];

export function findSettingsSection(id: string | undefined): SettingsSectionEntry | undefined {
  return SETTINGS_SECTIONS.find((section) => section.id === id);
}
