import { WandSparkles } from "lucide-react";

import { Button } from "@shared/ui/kit";
import type { StyleguideStartActionProps } from "../../styleguide/ui";
import { openColorWizard } from "./store";
import { t } from "../color-wizard.i18n";

/** The Design system empty state's way in: "Color wizard". */
export function StartWizardButton({ primary }: StyleguideStartActionProps) {
  return (
    <Button size="sm" variant={primary ? "default" : "outline"} onClick={() => openColorWizard()}>
      <WandSparkles />
      {t("shell.header.title")}
    </Button>
  );
}
