import { Check, WandSparkles } from "lucide-react";

import { Button, cn, DialogDescription, DialogTitle } from "@shared/ui/kit";
import { useColorWizardStore } from "../store";
import { stepIndex, WIZARD_STEPS } from "./steps";

/** The title and the steps: done ones checked, earlier ones clickable. */
export function WizardHeader() {
  const step = useColorWizardStore((s) => s.step);
  const created = useColorWizardStore((s) => s.created);
  const set = useColorWizardStore((s) => s.set);
  const at = stepIndex(step);
  return (
    <div className="flex items-center gap-3 border-b border-border py-2 pr-12 pl-4">
      <DialogTitle className="flex items-center gap-2 whitespace-nowrap">
        <WandSparkles className="size-4" />
        Color wizard
      </DialogTitle>
      <DialogDescription className="sr-only">
        Make a palette, its shades, a light and dark theme and text styles.
      </DialogDescription>
      <nav className="ml-3 hidden items-center gap-1 md:flex" aria-label="Steps">
        {WIZARD_STEPS.map((s, i) => {
          const done = created !== null || i < at;
          const active = created === null && i === at;
          return (
            <Button
              key={s.id}
              size="sm"
              variant="ghost"
              disabled={!done && !active}
              aria-current={active ? "step" : undefined}
              className={cn("gap-1.5 text-muted-foreground", active && "bg-hover text-foreground")}
              onClick={() => set({ step: s.id, created: null })}
            >
              <span
                className={cn(
                  "flex size-4.5 items-center justify-center rounded-sm border border-border-strong text-[10px]",
                  (done || active) && "border-primary bg-primary text-primary-foreground",
                )}
              >
                {done ? <Check className="size-3" /> : i + 1}
              </span>
              {s.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
