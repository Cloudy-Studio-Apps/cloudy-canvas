import { createEditorPoints } from "@canvas-ui";
import { definePoint } from "@shared/core";

import type { DesignEditorPoints } from "./design-editor-points.types";

/** The points the design editor's UI is assembled from (toolbar, rail tabs, sections, menu, …). */
export const designEditor: DesignEditorPoints = {
  ...createEditorPoints("design"),
  leftTabs: definePoint("design.editor.leftTabs", { keyOf: (tab) => tab.id }),
  propertySections: definePoint("design.editor.propertySections", {
    keyOf: (section) => section.id,
  }),
  mainMenu: definePoint("design.editor.mainMenu", { keyOf: (group) => group.id }),
  toolSidebars: definePoint("design.editor.toolSidebars", { keyOf: (entry) => entry.tool }),
  layerIcons: definePoint("design.editor.layerIcons", { keyOf: (entry) => entry.type }),
};
