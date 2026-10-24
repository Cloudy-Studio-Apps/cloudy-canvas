import { useThemeStore } from "@shared/stores/theme-store";
import type { ThemeDensity } from "@shared/core";
import type { ThemeMode } from "@shared/stores/theme-store.types";
import { Field, SegmentedControl } from "@shared/ui/kit";
import { SettingsSection } from "../../components/settings-section";
import { ThemeGrid } from "./theme-grid";

const MODES = [
  { value: "fixed", label: "One theme" },
  { value: "system", label: "Match system" },
] as const satisfies readonly { value: ThemeMode; label: string }[];

const DENSITIES = [
  { value: "theme", label: "Theme's" },
  { value: "compact", label: "Compact" },
  { value: "default", label: "Default" },
  { value: "comfortable", label: "Comfortable" },
] as const;

export function AppearanceSection() {
  const mode = useThemeStore((s) => s.mode);
  const themeId = useThemeStore((s) => s.themeId);
  const lightThemeId = useThemeStore((s) => s.lightThemeId);
  const darkThemeId = useThemeStore((s) => s.darkThemeId);
  const density = useThemeStore((s) => s.density);
  const { setMode, setTheme, setSystemTheme, setDensity } = useThemeStore.getState();

  return (
    <SettingsSection
      id="appearance"
      title="Appearance"
      description="How the app looks: its colors, fonts and how tight its controls are. Plugins can add themes. Files don't change: exports and previews keep their own colors."
    >
      <div className="space-y-6">
        <Field label="Theme" layout="inline" hint="Match system switches with your OS's dark mode.">
          <SegmentedControl label="Theme mode" value={mode} onChange={setMode} options={MODES} />
        </Field>
        {mode === "fixed" ? (
          <ThemeGrid selectedId={themeId} onSelect={setTheme} />
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">When your system is light</p>
              <ThemeGrid
                appearance="light"
                selectedId={lightThemeId}
                onSelect={(id) => setSystemTheme("light", id)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">When your system is dark</p>
              <ThemeGrid
                appearance="dark"
                selectedId={darkThemeId}
                onSelect={(id) => setSystemTheme("dark", id)}
              />
            </div>
          </>
        )}
        <Field
          label="Density"
          layout="inline"
          hint="How tall controls and rows are. A theme has its own; this overrides it."
          className="border-t pt-4"
        >
          <SegmentedControl
            label="Density"
            value={density ?? "theme"}
            onChange={(value) => setDensity(value === "theme" ? null : (value as ThemeDensity))}
            options={DENSITIES}
          />
        </Field>
      </div>
    </SettingsSection>
  );
}
