import { cn } from "@shared/ui/kit";
import { useColorWizardStore } from "../store";
import { PalettePanel } from "./palette-panel";
import { SourceTabs } from "./source-tabs";
import { useRandomShortcut } from "./use-random-shortcut";

/** Step 1: a source on the left, the palette on the right (the gallery gets the wide side). */
export function ColorsStep() {
  const wide = useColorWizardStore((s) => s.tab === "gallery");
  useRandomShortcut();
  return (
    <div
      className={cn(
        "grid h-full min-h-0 grid-cols-1 overflow-auto md:overflow-hidden",
        wide ? "md:grid-cols-[minmax(0,1fr)_340px]" : "md:grid-cols-[430px_minmax(0,1fr)]",
      )}
    >
      <section className="grid min-h-0 border-b border-border md:border-r md:border-b-0">
        <SourceTabs />
      </section>
      <PalettePanel />
    </div>
  );
}
