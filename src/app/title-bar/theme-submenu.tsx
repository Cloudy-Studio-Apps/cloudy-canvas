import { Check, Palette } from "lucide-react";

import { useThemeStore } from "@shared/stores/theme-store";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { MenuItemContent } from "@shared/ui/kit";
import { useThemes } from "@shared/ui/theme";
import { t } from "./title-bar.i18n";

/** The seal menu's Theme: every theme and Match system. */
export function ThemeSubmenu() {
  const themes = useThemes();
  const mode = useThemeStore((s) => s.mode);
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setMode = useThemeStore((s) => s.setMode);
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <MenuItemContent icon={<Palette />} label={t("theme")} />
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-44">
        {themes.map(({ theme }) => (
          <DropdownMenuItem key={theme.id} onSelect={() => setTheme(theme.id)}>
            {theme.label}
            {mode === "fixed" && themeId === theme.id && <Check className="ml-auto" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setMode("system")}>
          {t("matchSystem")}
          {mode === "system" && <Check className="ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
