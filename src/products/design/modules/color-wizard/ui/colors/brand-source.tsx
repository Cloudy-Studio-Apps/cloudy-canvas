import { Plus, Sparkles, Trash2 } from "lucide-react";

import { ColorField } from "@canvas-ui";
import { toast } from "@shared/stores/toast-store";
import { Button, IconButton } from "@shared/ui/kit";
import { colorOklch, oklchColor } from "../..";
import { buildFromBrand, useColorWizardStore } from "../store";
import { HarmonyPicker } from "./harmony-picker";
import { SectionLabel } from "./section-label";

const NAMES = ["Primary", "Secondary", "Accent"];

/** Colors that must stay (a logo's): locked in the palette, the rest built around them. */
export function BrandSource() {
  const brand = useColorWizardStore((s) => s.brand);
  const set = useColorWizardStore((s) => s.set);
  const setColors = (colors: string[]) => set({ brand: { ...brand, colors } });
  return (
    <div className="flex flex-col gap-3 p-4">
      <SectionLabel>Colors you must keep</SectionLabel>
      <p className="text-xs text-muted-foreground">
        Your logo or brand colors. They're locked in the palette, and the wizard builds the rest
        around them.
      </p>
      {brand.colors.map((hex, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-20 text-xs text-muted-foreground">{NAMES[i]}</span>
          <ColorField
            label={`${NAMES[i]} brand color`}
            color={hex.toLowerCase()}
            className="flex-1"
            onChange={(next) =>
              setColors(brand.colors.map((c, j) => (j === i ? next.color.toUpperCase() : c)))
            }
          />
          {brand.colors.length > 1 && (
            <IconButton
              label="Remove"
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
          Add a brand color
        </Button>
      )}
      <SectionLabel className="mt-2">Build the rest with</SectionLabel>
      <HarmonyPicker
        custom={false}
        value={brand.harmony}
        onChange={(harmony) => set({ brand: { ...brand, harmony } })}
      />
      <Button
        onClick={() => {
          buildFromBrand(brand.colors);
          toast({ title: "Brand colors are locked, so Generate random keeps them" });
        }}
      >
        <Sparkles />
        Build palette
      </Button>
      <p className="text-xs text-muted-foreground">
        The next step adds a neutral and status colors tinted toward your primary.
      </p>
    </div>
  );
}
