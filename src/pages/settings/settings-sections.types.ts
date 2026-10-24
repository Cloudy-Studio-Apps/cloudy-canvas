import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type SettingsGroupId = "preferences" | "extensions" | "help";

export interface SettingsGroup {
  id: SettingsGroupId;
  label: string;
}

/** One page of the settings, listed in the nav and shown at `/settings/<id>`. */
export interface SettingsSectionEntry {
  id: string;
  label: string;
  icon: LucideIcon;
  group: SettingsGroupId;
  component: ComponentType;
}
