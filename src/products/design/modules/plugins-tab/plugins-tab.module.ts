import { Puzzle } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { PluginsTab } from "./ui/plugins-tab";

/** The Plugins tab (a pointer to Settings › Plugins for now). */
export const pluginsTabModule = defineModule({
  id: "plugins-tab",
  register(host) {
    host.contribute(designEditor.leftTabs, {
      id: "plugins",
      label: "Plugins",
      icon: Puzzle,
      order: 30,
      component: PluginsTab,
    });
  },
});
