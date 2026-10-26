import { WandSparkles } from "lucide-react";

import { Button } from "@shared/ui/kit";
import type { StyleguideStartActionProps } from "../../styleguide/ui";
import { openColorWizard } from "./store";

/** The Design system empty state's way in: "Color wizard". */
export function StartWizardButton({ primary }: StyleguideStartActionProps) {
  return (
    <Button size="sm" variant={primary ? "default" : "outline"} onClick={() => openColorWizard()}>
      <WandSparkles />
      Color wizard
    </Button>
  );
}
