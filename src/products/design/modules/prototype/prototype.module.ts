import { defineModule } from "@shared/core";
import { designEditor, registerDesignMode } from "@design/ui/modules";
import { designCanvas } from "../../design-points";
import { registerPrototypeCanvas } from "./prototype.canvas";
import { PROTOTYPE_COMMANDS } from "./prototype.constants";
import { prototypeMode } from "./prototype.mode";
import { InteractionBadge } from "./ui/interaction-badge";
import { useToggleCommand } from "./ui/hooks/use-toggle-command";
import { t } from "./prototype.i18n";
import * as prototypeApi from ".";
import * as prototypeUi from "./ui";

/**
 * Prototype: how a design's screens (a page's top-level frames) link up and play, in the
 * Prototype mode. The interactions on nodes, the flow records and their pruning when screens or
 * pages are deleted.
 */
export const prototypeModule = defineModule({
  id: "prototype",
  tier: "feature",
  requires: ["core", "pages", "frame"],
  exports: { ...prototypeApi, ...prototypeUi },
  register(host) {
    registerPrototypeCanvas(host);
    registerDesignMode(host, prototypeMode);
    // Shift+E enters and leaves the mode, from any mode.
    host.contribute(designCanvas.hostCommands, {
      id: PROTOTYPE_COMMANDS.toggle,
      label: t("mode.toggle"),
      keys: [{ key: "e", shift: true }],
    });
    host.contribute(designEditor.sessionHooks, {
      id: PROTOTYPE_COMMANDS.toggle,
      use: useToggleCommand,
    });
    // Layers with interactions are marked while the mode is on.
    host.contribute(designEditor.layerBadges, {
      id: "prototype.interactions",
      component: InteractionBadge,
    });
  },
});
