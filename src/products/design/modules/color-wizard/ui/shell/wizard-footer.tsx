import { ArrowRight } from "lucide-react";

import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { tCommon } from "@shared/core";
import { Button, Kbd } from "@shared/ui/kit";
import { STYLEGUIDE_COMMANDS, STYLEGUIDE_MODE_ID } from "../../../styleguide";
import { useColorWizardStore } from "../store";
import { CreateButton } from "./create-button";
import { stepIndex, WIZARD_STEPS } from "./steps";
import { t } from "../../color-wizard.i18n";

const HINTS = {
  colors: null,
  roles: t("shell.footer.hintRoles"),
  theme: t("shell.footer.hintTheme"),
  type: t("shell.footer.hintType"),
  review: t("shell.footer.hintReview"),
} as const;

/** Back or Cancel, and Next or Create (with what it writes); Start over on the done screen. */
export function WizardFooter() {
  const engine = useDesignEngine();
  const inGuide = useDesignState((state) => state.mode === STYLEGUIDE_MODE_ID);
  const step = useColorWizardStore((s) => s.step);
  const created = useColorWizardStore((s) => s.created);
  const set = useColorWizardStore((s) => s.set);
  const at = stepIndex(step);
  const next = WIZARD_STEPS[at + 1];

  if (created) {
    return (
      <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-2.5">
        <Button variant="outline" onClick={() => set({ created: null, step: "colors" })}>
          {t("shell.footer.startOver")}
        </Button>
        <Button
          onClick={() => {
            set({ open: false });
            if (!inGuide) engine.runHostAction(STYLEGUIDE_COMMANDS.open);
          }}
        >
          {t("shell.footer.openGuide")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-t border-border px-4 py-2.5">
      <span className="text-xs text-muted-foreground">
        {step === "colors" ? (
          <>
            {t("shell.footer.pressBefore")} <Kbd>Space</Kbd> {t("shell.footer.pressAfter")}
          </>
        ) : (
          HINTS[step]
        )}
      </span>
      <div className="ml-auto" />
      {at > 0 ? (
        <Button variant="outline" onClick={() => set({ step: WIZARD_STEPS[at - 1]!.id })}>
          {t("shell.footer.back")}
        </Button>
      ) : (
        <Button variant="ghost" onClick={() => set({ open: false })}>
          {tCommon("cancel")}
        </Button>
      )}
      {next ? (
        <Button onClick={() => set({ step: next.id })}>
          {t("shell.footer.next", { step: next.label.toLowerCase() })}
          <ArrowRight />
        </Button>
      ) : (
        <CreateButton />
      )}
    </div>
  );
}
