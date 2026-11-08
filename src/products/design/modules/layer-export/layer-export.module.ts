import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas, designMcpTools } from "../../design-points";
import { layerExportTools } from "./layer-export.mcp";
import { EXPORT_ALL_COMMAND } from "./export-all.constants";
import { t } from "./layer-export.i18n";
import { ExportAllDialog, ExportSection, useExportAllCommand } from "./ui";
import { FolderDown } from "lucide-react";
import * as layerExportApi from ".";
import * as layerExportUi from "./ui";

/**
 * Exports saved on layers, as in Figma's Export section: rows of a size, a suffix and a file type,
 * which make all their files at once, into a folder or a zip.
 */
export const layerExportModule = defineModule({
  id: "layer-export",
  tier: "core",
  requires: ["core"],
  exports: { ...layerExportApi, ...layerExportUi },
  register(host) {
    host.contribute(designCanvas.hostCommands, {
      id: EXPORT_ALL_COMMAND,
      label: t("all.command"),
    });
    host.contribute(designEditor.sessionHooks, {
      id: EXPORT_ALL_COMMAND,
      use: useExportAllCommand,
    });
    host.contribute(designEditor.overlays, { id: "export-all", component: ExportAllDialog });
    host.contribute(designEditor.mainMenu, {
      id: "layer-export",
      order: 25,
      items: [{ command: EXPORT_ALL_COMMAND, label: t("all.command"), icon: FolderDown }],
    });
    host.contribute(designEditor.propertySections, {
      id: "export",
      order: 90,
      when: () => true,
      component: ExportSection,
    });
    host.contribute(designMcpTools, { id: "layer-export", tools: () => layerExportTools });
  },
});
