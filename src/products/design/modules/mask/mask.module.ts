import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designMcpTools, designCanvas } from "../../design-points";
import { designMasks } from "./design-masks";
import { maskTools } from "./mask.mcp";
import { MaskSection } from "./ui/mask-section";
import { MaskToolbarButton } from "./ui/mask-toolbar-button";
import { maskSectionShown, selectionIsMasks } from "./ui/mask-selection";
import { useMaskCommands } from "./ui/use-mask-commands";
import { t } from "./mask.i18n";

/**
 * Masks, as in Figma and a bit more: the canvas's masks (alpha, vector, luminance, inverted),
 * Use as mask (Ctrl+Alt+M) making mask groups, releasing masks, selecting a layer's mask or a
 * mask's layers, the Mask section, the menus and the agent tools.
 */
export const maskModule = defineModule({
  id: "mask",
  tier: "feature",
  // Mask groups are groups.
  requires: ["core", "group"],
  register(host) {
    host.contribute(designCanvas.masks, designMasks);
    host.contribute(
      designCanvas.hostCommands,
      {
        id: "useAsMask",
        label: t("commands.use"),
        keys: [{ code: "KeyM", mod: true, alt: true, label: "M" }],
      },
      { id: "releaseMask", label: t("commands.release") },
      { id: "selectMask", label: t("commands.select") },
      { id: "selectMasked", label: t("commands.selectMasked") },
    );
    host.contribute(designMcpTools, { id: "mask", tools: () => maskTools });

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
      label: t("title"),
      items: [
        { command: "useAsMask", label: t("commands.use") },
        { command: "releaseMask", label: t("commands.release") },
        { command: "selectMask", label: t("commands.select") },
        { command: "selectMasked", label: t("commands.selectMasked") },
      ],
    });
    host.contribute(designEditor.contextMenu, {
      id: "mask",
      menu: "selection",
      label: t("title"),
      items: [
        {
          command: "useAsMask",
          label: (_context, engine) =>
            selectionIsMasks(engine.elements(), engine.selectedIds())
              ? t("commands.remove")
              : t("commands.use"),
        },
        {
          command: "selectMasked",
          label: t("commands.selectMasked"),
          enabled: (_context, engine) => selectionIsMasks(engine.elements(), engine.selectedIds()),
        },
        {
          command: "selectMask",
          label: t("commands.select"),
          enabled: (context, engine) =>
            context.selectionCount > 0 &&
            !selectionIsMasks(engine.elements(), engine.selectedIds()),
        },
      ],
    });
  },
});
