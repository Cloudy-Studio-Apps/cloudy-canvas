import type { ModuleHost } from "@shared/core";
import { designCanvas } from "../../design-points";
import { STYLEGUIDE_COMMANDS } from "./mode";
import { t } from "./styleguide.i18n";

/** The view's, converting's and exporting's host commands. */
export function registerStyleguideCommands(host: ModuleHost): void {
  // Commands: the view, converting, exporting.
  host.contribute(
    designCanvas.hostCommands,
    { id: STYLEGUIDE_COMMANDS.open, label: t("commands.open") },
    { id: STYLEGUIDE_COMMANDS.convert, label: t("commands.convert") },
    {
      id: STYLEGUIDE_COMMANDS.exportSection,
      label: t("commands.exportSection"),
    },
    { id: STYLEGUIDE_COMMANDS.exportSystem, label: t("commands.exportSystem") },
  );
}
