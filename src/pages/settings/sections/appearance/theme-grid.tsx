import { themeRegistry } from "@shared/core";
import { SelectableCard } from "@shared/ui/kit";
import { useThemes } from "@shared/ui/theme";
import type { ThemeGridProps } from "./appearance.types";
import { ThemePreviewPicture } from "./theme-preview-picture";

/** The themes as cards to pick from, a picture of each; a missing pick is listed as such. */
export function ThemeGrid({ appearance, selectedId, onSelect }: ThemeGridProps) {
  const themes = useThemes().filter(({ theme }) => !appearance || theme.appearance === appearance);
  const missing = !themeRegistry.get(selectedId);

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3">
      {themes.map(({ theme, owner }) => (
        <SelectableCard
          key={theme.id}
          selected={theme.id === selectedId}
          onSelect={() => onSelect(theme.id)}
          media={<ThemePreviewPicture preview={theme.preview} />}
          title={theme.label}
          description={owner === "app" ? theme.description : `From the plugin “${owner}”`}
        />
      ))}
      {missing && (
        <p className="col-span-full text-sm text-muted-foreground">
          “{selectedId}” isn&apos;t installed (its plugin was removed or turned off), so a built-in
          theme is shown instead.
        </p>
      )}
    </div>
  );
}
