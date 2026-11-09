import { Gem } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { AssetsTab } from "./ui/assets-tab";
import { t } from "./assets.i18n";
import * as assetsApi from ".";

/**
 * The Assets tab: the pictures of the project libraries the file uses and the file's own, to drag
 * onto the canvas or double-click to place (through the image module).
 */
export const assetsModule = defineModule({
  id: "assets",
  tier: "feature",
  requires: ["image"],
  exports: { ...assetsApi },
  register(host) {
    host.contribute(designEditor.leftTabs, {
      id: "assets",
      label: t("title"),
      icon: Gem,
      order: 20,
      component: AssetsTab,
    });
  },
});
