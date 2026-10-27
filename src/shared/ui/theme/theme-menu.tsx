import { Check, Settings2 } from "lucide-react";

import { useThemeStore } from "@shared/stores/theme-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import type { ThemeDotProps, ThemeMenuProps } from "./theme.types";
import { useThemes } from "./use-active-theme";
import { t } from "./theme.i18n";

/** A quick theme switcher: every theme, Match system and the Appearance settings. */
export function ThemeMenu({ trigger, align = "end", onOpenSettings }: ThemeMenuProps) {
  const themes = useThemes();
  const mode = useThemeStore((s) => s.mode);
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-48">
        <DropdownMenuLabel>{t("menu.title")}</DropdownMenuLabel>
        {themes.map(({ theme }) => (
          <DropdownMenuItem key={theme.id} onSelect={() => setTheme(theme.id)}>
            <ThemeDot color={theme.preview.background} ring={theme.preview.primary} />
            {theme.label}
            {mode === "fixed" && themeId === theme.id && <Check className="ml-auto" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setMode("system")}>
          {t("menu.system")}
          {mode === "system" && <Check className="ml-auto" />}
        </DropdownMenuItem>
        {onOpenSettings && (
          <DropdownMenuItem onSelect={onOpenSettings}>
            <Settings2 />
            {t("menu.appearance")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeDot({ color, ring }: ThemeDotProps) {
  return (
    <span
      aria-hidden
      className="size-3.5 shrink-0 rounded-xs border"
      style={{ background: color, borderColor: ring }}
    />
  );
}
