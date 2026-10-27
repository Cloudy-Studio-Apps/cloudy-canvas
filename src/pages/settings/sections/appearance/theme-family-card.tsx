import { useState } from "react";

import type { ThemeAppearance } from "@shared/core";
import { SegmentedControl, SelectableCard } from "@shared/ui/kit";
import type { ThemeFamilyCardProps } from "./appearance.types";
import { ThemePreviewPicture } from "./theme-preview-picture";
import { t } from "../../settings.i18n";

const VARIANTS = [
  { value: "light", label: t("appearance.light") },
  { value: "dark", label: t("appearance.dark") },
] as const satisfies readonly { value: ThemeAppearance; label: string }[];

/**
 * One family as a card: the variant shown is the selected one, else the one picked with the
 * Light/Dark switch (only when the family has both), else the app's current appearance.
 */
export function ThemeFamilyCard({ family, selectedId, onSelect, preferred }: ThemeFamilyCardProps) {
  const [picked, setPicked] = useState<ThemeAppearance | null>(null);
  const { light, dark } = family;
  const selected = light?.id === selectedId || dark?.id === selectedId;
  const wanted = selected ? (light?.id === selectedId ? "light" : "dark") : (picked ?? preferred);
  const theme = (wanted === "light" ? (light ?? dark) : (dark ?? light))!;

  const pickVariant = (appearance: ThemeAppearance) => {
    setPicked(appearance);
    const variant = family[appearance];
    if (selected && variant) onSelect(variant.id);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <SelectableCard
        selected={selected}
        onSelect={() => onSelect(theme.id)}
        media={<ThemePreviewPicture preview={theme.preview} />}
        title={family.label}
        description={theme.description}
      />
      {light && dark && (
        <SegmentedControl
          label={t("appearance.variant")}
          value={theme.appearance}
          onChange={pickVariant}
          options={VARIANTS}
          size="sm"
          fullWidth
        />
      )}
    </div>
  );
}
