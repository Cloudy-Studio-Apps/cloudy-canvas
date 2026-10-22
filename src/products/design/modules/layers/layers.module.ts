import { Layers } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { LayersTab } from "./ui/layers-tab";

/** The Layers tab: the layer tree (select, rename, hide, lock) and the pages. */
export const layersModule = defineModule({
  id: "layers",
  requires: ["core"],
  register(host) {
    host.contribute(designEditor.leftTabs, {
      id: "layers",
      label: "Layers",
      icon: Layers,
      order: 10,
      component: LayersTab,
    });
  },
});
