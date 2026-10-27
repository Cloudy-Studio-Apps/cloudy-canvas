import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas, designMcpTools } from "../../design-points";
import { styleguideStartActions } from "../styleguide/ui";
import { OPEN_COLOR_WIZARD } from "./color-wizard.constants";
import { colorWizardTools } from "./color-wizard.mcp";
import { ColorWizard } from "./ui";
import { StartWizardButton } from "./ui/start-wizard-button";
import { useColorWizardCommand } from "./ui/use-color-wizard-command";
import { t } from "./color-wizard.i18n";

/**
 * The color wizard: a dialog that builds a palette (wheel, brand colors, an image, the file's
 * fills, a gallery, pasted tokens), its roles and shades, a Light/Dark theme and text styles, and
 * writes them as one undo step. Opened from the Design system's empty state and the main menu;
 * agents run it with `run_color_wizard`.
 */
export const colorWizardModule = defineModule({
  id: "color-wizard",
  tier: "feature",
  requires: ["core", "pages", "text", "variables", "styleguide"],
  register(host) {
    host.contribute(designEditor.overlays, { id: "color-wizard", component: ColorWizard });
    host.contribute(styleguideStartActions, {
      id: "color-wizard",
      order: 10,
      component: StartWizardButton,
    });
    host.contribute(designCanvas.hostCommands, {
      id: OPEN_COLOR_WIZARD,
      label: t("command.open"),
    });
    host.contribute(designEditor.sessionHooks, {
      id: "color-wizard.command",
      use: useColorWizardCommand,
    });
    host.contribute(designEditor.mainMenu, {
      id: "color-wizard",
      order: 42.6,
      items: [{ command: OPEN_COLOR_WIZARD, label: t("command.open") }],
    });
    host.contribute(designMcpTools, { id: "color-wizard", tools: () => colorWizardTools });
  },
});
