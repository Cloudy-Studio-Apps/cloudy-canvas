import { useState } from "react";

import { useThemeStore } from "@shared/stores/theme-store";
import type { ThemeDensity } from "@shared/core";
import type { ThemeMode } from "@shared/stores/theme-store.types";
import { Field, SearchInput, SegmentedControl } from "@shared/ui/kit";
import { SettingsSection } from "../../components/settings-section";
import { ThemeGrid } from "./theme-grid";
import { t } from "../../settings.i18n";

const MODES = [
  { value: "fixed", label: t("appearance.oneTheme") },
  { value: "system", label: t("appearance.matchSystem") },
] as const satisfies readonly { value: ThemeMode; label: string }[];

const DENSITIES = [
  { value: "theme", label: t("appearance.densityOptions.theme") },
  { value: "compact", label: t("appearance.densityOptions.compact") },
  { value: "default", label: t("appearance.densityOptions.default") },
  { value: "comfortable", label: t("appearance.densityOptions.comfortable") },
] as const;

export function AppearanceSection() {
  const mode = useThemeStore((s) => s.mode);
  const themeId = useThemeStore((s) => s.themeId);
  const lightThemeId = useThemeStore((s) => s.lightThemeId);
  const darkThemeId = useThemeStore((s) => s.darkThemeId);
  const density = useThemeStore((s) => s.density);
  const { setMode, setTheme, setSystemTheme, setDensity } = useThemeStore.getState();
  const [query, setQuery] = useState("");

  return (
    <SettingsSection
      id="appearance"
      title={t("nav.appearance")}
      description={t("appearance.description")}
    >
      <div className="space-y-6">
        <Field label={t("appearance.theme")} layout="inline" hint={t("appearance.themeHint")}>
          <SegmentedControl
            label={t("appearance.themeMode")}
            value={mode}
            onChange={setMode}
            options={MODES}
          />
        </Field>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t("appearance.search")}
          aria-label={t("appearance.search")}
        />
        {mode === "fixed" ? (
          <ThemeGrid selectedId={themeId} onSelect={setTheme} query={query} />
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("appearance.systemLight")}</p>
              <ThemeGrid
                appearance="light"
                selectedId={lightThemeId}
                onSelect={(id) => setSystemTheme("light", id)}
                query={query}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("appearance.systemDark")}</p>
              <ThemeGrid
                appearance="dark"
                selectedId={darkThemeId}
                onSelect={(id) => setSystemTheme("dark", id)}
                query={query}
              />
            </div>
          </>
        )}
        <Field
          label={t("appearance.density")}
          layout="inline"
          hint={t("appearance.densityHint")}
          className="border-t pt-4"
        >
          <SegmentedControl
            label={t("appearance.density")}
            value={density ?? "theme"}
            onChange={(value) => setDensity(value === "theme" ? null : (value as ThemeDensity))}
            options={DENSITIES}
          />
        </Field>
      </div>
    </SettingsSection>
  );
}
