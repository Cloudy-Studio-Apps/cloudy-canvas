import { Plus, Sparkles, Trash2 } from "lucide-react";

import { ColorField } from "@canvas-ui";
import { toast } from "@shared/stores/toast-store";
import { Button, IconButton } from "@shared/ui/kit";
import { colorOklch, oklchColor } from "../..";
import { buildFromBrand, useColorWizardStore } from "../store";
import { HarmonyPicker } from "./harmony-picker";
import { SectionLabel } from "./section-label";
import { t } from "../../color-wizard.i18n";

const NAMES = [t("sources.brand.primary"), t("sources.brand.secondary"), t("sources.brand.accent")];

/** Colors that must stay (a logo's): locked in the palette, the rest built around them. */
export function BrandSource() {
  const brand = useColorWizardStore((s) => s.brand);
  const set = useColorWizardStore((s) => s.set);
  const setColors = (colors: string[]) => set({ brand: { ...brand, colors } });
  return (
    <div className="flex flex-col gap-3 p-4">
      <SectionLabel>{t("sources.brand.keepTitle")}</SectionLabel>
      <p className="text-xs text-muted-foreground">{t("sources.brand.keepHint")}</p>
      {brand.colors.map((hex, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-20 text-xs text-muted-foreground">{NAMES[i]}</span>
          <ColorField
            label={t("sources.brand.brandColor", { name: NAMES[i] ?? "" })}
            color={hex.toLowerCase()}
            className="flex-1"
            onChange={(next) =>
              setColors(brand.colors.map((c, j) => (j === i ? next.color.toUpperCase() : c)))
            }
          />
          {brand.colors.length > 1 && (
            <IconButton
              label={t("sources.brand.remove")}
              onClick={() => setColors(brand.colors.filter((_, j) => j !== i))}
            >
              <Trash2 />
            </IconButton>
          )}
        </div>
      ))}
      {brand.colors.length < 3 && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            const first = colorOklch(brand.colors[0] ?? "#0B78B3");
            setColors([...brand.colors, oklchColor(first.L, first.C, first.h + 150)]);
          }}
        >
          <Plus />
          {t("sources.brand.add")}
        </Button>
      )}
      <SectionLabel className="mt-2">{t("sources.brand.buildWith")}</SectionLabel>
      <HarmonyPicker
        custom={false}
        value={brand.harmony}
        onChange={(harmony) => set({ brand: { ...brand, harmony } })}
      />
      <Button
        onClick={() => {
          buildFromBrand(brand.colors);
          toast({ title: t("sources.brand.locked") });
        }}
      >
        <Sparkles />
        {t("sources.brand.build")}
      </Button>
      <p className="text-xs text-muted-foreground">{t("sources.brand.nextStep")}</p>
    </div>
  );
}
