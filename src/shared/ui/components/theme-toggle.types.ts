import type { LucideIcon } from "lucide-react";

import type { ThemePreference } from "@shared/stores/theme-store.types";

export interface ThemeOption {
  value: ThemePreference;
  label: string;
  icon: LucideIcon;
}
