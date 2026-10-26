import { ArrowDownWideNarrow, Eye, Minus, Plus, Redo2, Shuffle, Undo2 } from "lucide-react";

import { Button, IconButton, SelectField, type SelectOption } from "@shared/ui/kit";
import type { CvdKind } from "../..";
import {
  randomizePalette,
  redoPalette,
  resizePalette,
  sortPalette,
  undoPalette,
  useColorWizardStore,
} from "../store";

const CVD_OPTIONS: readonly SelectOption<CvdKind>[] = [
  { value: "none", label: "Normal vision" },
  { value: "protanopia", label: "Protanopia" },
  { value: "deuteranopia", label: "Deuteranopia" },
  { value: "tritanopia", label: "Tritanopia" },
  { value: "achromatopsia", label: "Achromatopsia" },
];

/** Undo and redo, how many colors, sort, a color-vision preview and Generate random. */
export function PaletteToolbar() {
  const count = useColorWizardStore((s) => s.palette.length);
  const canUndo = useColorWizardStore((s) => s.past.length > 0);
  const canRedo = useColorWizardStore((s) => s.future.length > 0);
  const cvd = useColorWizardStore((s) => s.cvd);
  const set = useColorWizardStore((s) => s.set);
  return (
    <div className="flex flex-wrap items-center gap-1">
      <IconButton label="Undo" disabled={!canUndo} onClick={undoPalette}>
        <Undo2 />
      </IconButton>
      <IconButton label="Redo" disabled={!canRedo} onClick={redoPalette}>
        <Redo2 />
      </IconButton>
      <span className="mx-1.5 h-4.5 w-px bg-border" />
      <span className="mr-1 text-xs text-muted-foreground">Colors</span>
      <IconButton label="Fewer colors" size="sm" onClick={() => resizePalette(count - 1)}>
        <Minus />
      </IconButton>
      <span className="min-w-5 text-center text-xs tabular-nums">{count}</span>
      <IconButton label="More colors" size="sm" onClick={() => resizePalette(count + 1)}>
        <Plus />
      </IconButton>
      <IconButton label="Sort by lightness" onClick={sortPalette}>
        <ArrowDownWideNarrow />
      </IconButton>
      <span className="mx-1.5 h-4.5 w-px bg-border" />
      <Eye className="size-4 text-muted-foreground" />
      <SelectField
        label="See it as people with color-vision deficiencies do"
        value={cvd}
        options={CVD_OPTIONS}
        onChange={(value) => set({ cvd: value })}
        className="w-36"
      />
      <Button variant="outline" size="sm" className="ml-auto" onClick={randomizePalette}>
        <Shuffle />
        Generate random
      </Button>
    </div>
  );
}
