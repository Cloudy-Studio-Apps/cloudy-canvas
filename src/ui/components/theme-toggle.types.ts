import type { LucideIcon } from "lucide-react";

import type { ThemePreference } from "@stores/theme-store.types";

export interface ThemeOption {
  value: ThemePreference;
  label: string;
  icon: LucideIcon;
}
