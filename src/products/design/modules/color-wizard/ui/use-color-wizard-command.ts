import { useEffect } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { OPEN_COLOR_WIZARD } from "../color-wizard.constants";
import { openColorWizard } from "./store";

/** Runs the `openColorWizard` command (the main menu's "Color wizard…"). */
export function useColorWizardCommand(): void {
  const engine = useDesignEngine();
  useEffect(() => engine.handleHostAction(OPEN_COLOR_WIZARD, () => openColorWizard()), [engine]);
}
