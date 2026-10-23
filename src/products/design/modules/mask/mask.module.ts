import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designAgentTools, designCanvas } from "../../design-points";
import { designMasks } from "./design-masks";
import { maskTools } from "./mask.agent-tools";
import { MaskSection } from "./ui/mask-section";
import { MaskToolbarButton } from "./ui/mask-toolbar-button";
import { maskSectionShown, selectionIsMasks } from "./ui/mask-selection";
import { useMaskCommands } from "./ui/use-mask-commands";

/**
 * Masks, as in Figma and a bit more: the canvas's masks (alpha, vector, luminance, inverted),
 * Use as mask (Ctrl+Alt+M) making mask groups, releasing masks, selecting a layer's mask or a
 * mask's layers, the Mask section, the menus and the agent tools.
 */
export const maskModule = defineModule({
  id: "mask",
  // Mask groups are groups.
  requires: ["core", "group"],
  register(host) {
    host.contribute(designCanvas.masks, designMasks);
    host.contribute(
      designCanvas.hostCommands,
      {
        id: "useAsMask",
        label: "Use as mask",
        keys: [{ code: "KeyM", mod: true, alt: true, label: "M" }],
      },
      { id: "releaseMask", label: "Release mask" },
      { id: "selectMask", label: "Select mask" },
      { id: "selectMasked", label: "Select masked layers" },
    );
    host.contribute(designAgentTools, { id: "mask", tools: () => maskTools });

    host.contribute(designEditor.sessionHooks, { id: "mask-commands", use: useMaskCommands });
    host.contribute(designEditor.selectionActions, {
      id: "mask",
      order: 10,
      component: MaskToolbarButton,
    });
    host.contribute(designEditor.propertySections, {
      id: "mask",
      tab: "design",
      order: 45,
      when: maskSectionShown,
      component: MaskSection,
    });
    host.contribute(designEditor.mainMenu, {
      id: "mask",
      order: 35.5,
      label: "Mask",
      items: [
        { command: "useAsMask", label: "Use as mask" },
        { command: "releaseMask", label: "Release mask" },
        { command: "selectMask", label: "Select mask" },
        { command: "selectMasked", label: "Select masked layers" },
      ],
    });
    host.contribute(designEditor.contextMenu, {
      id: "mask",
      menu: "selection",
      label: "Mask",
      items: [
        {
          command: "useAsMask",
          label: (_context, engine) =>
            selectionIsMasks(engine.elements(), engine.selectedIds())
              ? "Remove mask"
              : "Use as mask",
        },
        {
          command: "selectMasked",
          label: "Select masked layers",
          enabled: (_context, engine) => selectionIsMasks(engine.elements(), engine.selectedIds()),
        },
        {
          command: "selectMask",
          label: "Select mask",
          enabled: (context, engine) =>
            context.selectionCount > 0 &&
            !selectionIsMasks(engine.elements(), engine.selectedIds()),
        },
      ],
    });
  },
});
