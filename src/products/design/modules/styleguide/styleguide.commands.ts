import type { ModuleHost } from "@shared/core";
import { designCanvas } from "../../design-points";
import { STYLEGUIDE_COMMANDS } from "./mode";

/** The view's, converting's and exporting's host commands. */
export function registerStyleguideCommands(host: ModuleHost): void {
  // Commands: the view, converting, exporting.
  host.contribute(
    designCanvas.hostCommands,
    { id: STYLEGUIDE_COMMANDS.open, label: "Design system" },
    { id: STYLEGUIDE_COMMANDS.convert, label: "Convert to design" },
    { id: STYLEGUIDE_COMMANDS.exportSection, label: "Export this section…" },
    { id: STYLEGUIDE_COMMANDS.exportSystem, label: "Export the design system as PDF" },
  );
}
