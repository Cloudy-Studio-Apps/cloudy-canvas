import { Frame } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardCanvas } from "../../board-points";
import { SECTION_COLORS } from "../../palette";
import { withSectionMembers } from "./section-members";
import { SectionKind } from "./section.kind";
import { SectionTool } from "./section.tool";
import { SectionOptions } from "./ui/section-options";
import { SectionsMenu } from "./ui/sections-menu";

/**
 * Sections: the kind, the tool (Shift+S) and its panel, taking what's inside a section along when
 * it moves or is deleted, and the top bar's Sections menu.
 */
export const sectionModule = defineModule({
  id: "section",
  register(host) {
    host.contribute(boardCanvas.kinds, new SectionKind());
    host.contribute(boardCanvas.tools, {
      id: "section",
      create: (ctx) => new SectionTool(ctx),
      keys: [{ key: "s", shift: true }],
    });
    host.contribute(boardCanvas.options, { sectionColor: SECTION_COLORS[0].value });
    host.contribute(boardCanvas.withMembers, (ids, elements, _purpose, kinds) =>
      withSectionMembers(ids, elements, kinds),
    );

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
