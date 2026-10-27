import { Bot, HardDrive, Info, Keyboard, Languages, Palette, Puzzle, Users } from "lucide-react";

import { AboutPage } from "./sections/about-page";
import { AppearanceSection } from "./sections/appearance";
import { AgentsSection } from "./sections/agents-section";
import { CollaborationSection } from "./sections/collaboration";
import { FilesSection } from "./sections/files-section";
import { LanguageSection } from "./sections/language-section";
import { PluginsSection } from "./sections/plugins";
import { ShortcutsSection } from "./sections/shortcuts-section";
import type { SettingsGroup, SettingsSectionEntry } from "./settings-sections.types";
import { t } from "./settings.i18n";

export const SETTINGS_GROUPS: readonly SettingsGroup[] = [
  { id: "preferences", label: t("groups.preferences") },
  { id: "extensions", label: t("groups.extensions") },
  { id: "help", label: t("groups.help") },
];

/** In nav order; the first is what `/settings` shows. */
export const SETTINGS_SECTIONS: readonly SettingsSectionEntry[] = [
  {
    id: "appearance",
    label: t("nav.appearance"),
    icon: Palette,
    group: "preferences",
    component: AppearanceSection,
  },
  {
    id: "language",
    label: t("language.title"),
    icon: Languages,
    group: "preferences",
    component: LanguageSection,
  },
  {
    id: "files",
    label: t("nav.files"),
    icon: HardDrive,
    group: "preferences",
    component: FilesSection,
  },
  {
    id: "collaboration",
    label: t("nav.collaboration"),
    icon: Users,
    group: "preferences",
    component: CollaborationSection,
  },
  {
    id: "agents",
    label: t("nav.agents"),
    icon: Bot,
    group: "extensions",
    component: AgentsSection,
  },
  {
    id: "plugins",
    label: t("nav.plugins"),
    icon: Puzzle,
    group: "extensions",
    component: PluginsSection,
  },
  {
    id: "shortcuts",
    label: t("nav.shortcuts"),
    icon: Keyboard,
    group: "help",
    component: ShortcutsSection,
  },
  { id: "about", label: t("nav.about"), icon: Info, group: "help", component: AboutPage },
];

export function findSettingsSection(id: string | undefined): SettingsSectionEntry | undefined {
  return SETTINGS_SECTIONS.find((section) => section.id === id);
}
