import { Layers } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designMcpTools } from "../../design-points";
import { layersTools } from "./mcp";
import { LayersTab } from "./ui/layers-tab";

/**
 * The Layers tab: the page's layer tree (select, rename,
 * hide, lock), and the tree for agents (`get_layer_tree`).
 */
export const layersModule = defineModule({
  id: "layers",
  tier: "core",
  requires: ["core"],
  register(host) {
    host.contribute(designEditor.leftTabs, {
      id: "layers",
      label: "Layers",
      icon: Layers,
      order: 10,
      component: LayersTab,
    });
    host.contribute(designMcpTools, { id: "layers", tools: () => layersTools });
  },
});
