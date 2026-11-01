import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designMcpTools } from "../../design-points";
import { layerExportTools } from "./layer-export.mcp";
import { ExportSection } from "./ui";
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
    host.contribute(designEditor.propertySections, {
      id: "export",
      tab: "design",
      order: 90,
      when: () => true,
      component: ExportSection,
    });
    host.contribute(designMcpTools, { id: "layer-export", tools: () => layerExportTools });
  },
});
