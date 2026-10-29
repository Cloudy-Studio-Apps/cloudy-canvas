import { Frame } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardStarters } from "../core/ui";
import { SectionOptions } from "./ui/section-options";
import { SectionsMenu } from "./ui/sections-menu";
import { retroStarter } from "./ui/starters/retro.starter";
import * as sectionApi from ".";
import { registerSectionCanvas } from "./section.canvas";

/**
 * Sections: the kind, the tool (Shift+S) and its panel, taking what's inside a section along when
 * it moves or is deleted, aligning a lone element with the section it's in, and the top bar's
 * Sections menu.
 */
export const sectionModule = defineModule({
  id: "section",
  tier: "feature",
  // The retro starter puts sticky notes in its sections.
  uses: ["sticky"],
  exports: { ...sectionApi },
  register(host) {
    registerSectionCanvas(host);
    host.contribute(boardStarters, retroStarter);

    host.contribute(boardEditor.tools, {
      tool: "section",
      element: "section",
      icon: Frame,
      toolbar: { group: 1, order: 70 },
    });
    host.contribute(boardEditor.toolPanels, { tool: "section", component: SectionOptions });
    host.contribute(boardEditor.selectionPanels, { type: "section", component: SectionOptions });
    host.contribute(boardEditor.topBar, {
      id: "section.menu",
      order: 10,
      component: SectionsMenu,
    });
  },
});
