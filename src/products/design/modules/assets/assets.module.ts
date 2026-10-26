import { Gem } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { AssetsTab } from "./ui/assets-tab";

/** The Assets tab (components and libraries; a placeholder for now). */
export const assetsModule = defineModule({
  id: "assets",
  tier: "feature",
  register(host) {
    host.contribute(designEditor.leftTabs, {
      id: "assets",
      label: "Assets",
      icon: Gem,
      order: 20,
      component: AssetsTab,
    });
  },
});
