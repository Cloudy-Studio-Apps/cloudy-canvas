import { Puzzle } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { PluginsTab } from "./ui/plugins-tab";
import { t } from "./plugins-tab.i18n";
import * as pluginsTabApi from ".";

/** The Plugins tab (a pointer to Settings › Plugins for now). */
export const pluginsTabModule = defineModule({
  id: "plugins-tab",
  tier: "core",
  exports: { ...pluginsTabApi },
  register(host) {
    host.contribute(designEditor.leftTabs, {
      id: "plugins",
      label: t("title"),
      icon: Puzzle,
      order: 30,
      component: PluginsTab,
    });
  },
});
