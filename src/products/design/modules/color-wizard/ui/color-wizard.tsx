import { Confetti, Dialog, DialogContent } from "@shared/ui/kit";
import { WizardBody } from "./shell/wizard-body";
import { WizardFooter } from "./shell/wizard-footer";
import { WizardHeader } from "./shell/wizard-header";
import { useColorWizardStore } from "./store";
import { useExistingPalette } from "./use-existing-palette";

/**
 * The color wizard (an `overlays` entry): a large dialog whose steps build a palette, its roles
 * and shades, a Light/Dark theme and text styles, then write them as one undo step and celebrate.
 */
export function ColorWizard() {
  const open = useColorWizardStore((s) => s.open);
  const set = useColorWizardStore((s) => s.set);
  const celebration = useColorWizardStore((s) => s.celebration);
  const palette = useColorWizardStore((s) => s.palette);
  useExistingPalette(open);
  return (
    <Dialog open={open} onOpenChange={(next) => set({ open: next })}>
      <DialogContent
        className="h-[min(800px,calc(100vh-2rem))] w-[min(1240px,calc(100vw-2rem))] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden bg-surface p-0 sm:max-w-none"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <WizardHeader />
        <div className="min-h-0 overflow-hidden">
          <WizardBody />
        </div>
        <WizardFooter />
        {celebration > 0 && <Confetti burst={celebration} colors={palette.map((c) => c.hex)} />}
      </DialogContent>
    </Dialog>
  );
}
