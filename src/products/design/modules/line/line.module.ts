import { MoveUpRight, Slash } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { ofType } from "@design/ui/modules/section-filters";
import { designCanvas } from "../../design-points";
import { LineKind } from "./line.kind";
import { LineTool } from "./line.tool";
import { LineSection } from "./ui/line-section";
import { t } from "./line.i18n";
import * as lineApi from ".";

/** Lines and arrows: the kind, the line (L) and arrow (Shift+L) tools, and the line section. */
export const lineModule = defineModule({
  id: "line",
  tier: "feature",
  requires: ["core"],
  exports: { ...lineApi },
  register(host) {
    host.contribute(designCanvas.kinds, new LineKind());
    host.contribute(
      designCanvas.tools,
      {
        id: "line",
        create: (ctx) => new LineTool(ctx, "line", "none", t("label")),
        keys: [{ key: "l" }],
      },
      {
        id: "arrow",
        create: (ctx) => new LineTool(ctx, "arrow", "arrow", t("arrow.label")),
        keys: [{ key: "l", shift: true }],
      },
    );
    host.contribute(
      designEditor.tools,
      {
        tool: "line",
        element: "line",
        icon: Slash,
        toolbar: { group: 1, order: 30, menu: "shapes" },
      },
      {
        tool: "arrow",
        label: t("arrow.label"),
        description: t("arrow.description"),
        icon: MoveUpRight,
        toolbar: { group: 1, order: 40, menu: "shapes" },
      },
    );
    host.contribute(designEditor.propertySections, {
      id: "line",
      tab: "design",
      order: 16,
      when: ofType("line"),
      component: LineSection,
    });
  },
});
