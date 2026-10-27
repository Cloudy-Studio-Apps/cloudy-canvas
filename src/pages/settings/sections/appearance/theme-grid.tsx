import {
  groupThemeFamilies,
  matchThemeFamily,
  themeRegistry,
  type ThemeFamily,
} from "@shared/core";
import { usePluginsStore } from "@shared/stores/plugins-store";
import { EmptyState } from "@shared/ui/kit";
import { useActiveTheme, useThemes } from "@shared/ui/theme";
import type { ThemeGridProps } from "./appearance.types";
import { ThemeSection } from "./theme-section";
import { t } from "../../settings.i18n";

/**
 * The themes to pick from as family cards matching the search: the app's first, then one section
 * per plugin under its name; a missing pick is listed as such.
 */
export function ThemeGrid({ appearance, selectedId, onSelect, query }: ThemeGridProps) {
  const themes = useThemes().filter(({ theme }) => !appearance || theme.appearance === appearance);
  const installed = usePluginsStore((s) => s.installed);
  const preferred = useActiveTheme().resolved.appearance;
  const missing = !themeRegistry.get(selectedId);

  const ownerName = (owner: string) =>
    owner === "app"
      ? undefined
      : (installed.find((p) => p.manifest.id === owner)?.manifest.name ?? owner);
  const byOwner = new Map<string, ThemeFamily[]>();
  for (const family of groupThemeFamilies(themes)) {
    if (!matchThemeFamily(family, query, ownerName(family.owner))) continue;
    byOwner.set(family.owner, [...(byOwner.get(family.owner) ?? []), family]);
  }
  const sections = [...byOwner].sort(([a], [b]) => Number(a !== "app") - Number(b !== "app"));

  return (
    <div className="space-y-4">
      {sections.map(([owner, families]) => (
        <ThemeSection
          key={owner}
          heading={ownerName(owner)}
          families={families}
          selectedId={selectedId}
          onSelect={onSelect}
          preferred={preferred}
        />
      ))}
      {sections.length === 0 && <EmptyState title={t("appearance.noMatch", { query })} />}
      {missing && (
        <p className="text-sm text-muted-foreground">
          {t("appearance.missing", { id: selectedId })}
        </p>
      )}
    </div>
  );
}
