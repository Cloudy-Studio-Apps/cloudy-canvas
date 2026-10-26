import { Palette } from "lucide-react";

import type { ModuleHost } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas } from "../../design-points";
import { STYLEGUIDE_MODE, STYLEGUIDE_MODE_ID, STYLEGUIDE_TOOL, StyleguideTool } from "./mode";
import { StyleguideEmpty } from "./ui/empty/styleguide-empty";
import { useStyleguideScope } from "./ui/hooks/use-styleguide-scope";
import { useStyleguideSelection } from "./ui/hooks/use-styleguide-selection";
import { StyleguideSidebar } from "./ui/sidebar/styleguide-sidebar";
import { StyleguideTab } from "./ui/tab/styleguide-tab";

/**
 * The Design system mode: its canvas mode and tool, its scope and selection, the empty state, its
 * rail tab and sidebar.
 */
export function registerStyleguideMode(host: ModuleHost): void {
  // The Design system mode.
  host.contribute(designCanvas.modes, STYLEGUIDE_MODE);
  host.contribute(designCanvas.tools, {
    id: STYLEGUIDE_TOOL,
    create: (ctx) => new StyleguideTool(ctx),
  });
  host.contribute(designEditor.modes, {
    id: STYLEGUIDE_MODE_ID,
    label: "Design system",
    description: "Your variables and styles as a living style guide.",
    icon: Palette,
    order: 20,
  });
  host.contribute(designEditor.sessionHooks, {
    id: "styleguide.scope",
    use: useStyleguideScope,
  });
  host.contribute(designEditor.sessionHooks, {
    id: "styleguide.selection",
    use: useStyleguideSelection,
  });
  host.contribute(designEditor.overlays, { id: "styleguide.empty", component: StyleguideEmpty });
  host.contribute(designEditor.leftTabs, {
    id: "styleguide",
    label: "Design system",
    icon: Palette,
    order: 10,
    modes: [STYLEGUIDE_MODE_ID],
    component: StyleguideTab,
  });
  host.contribute(designEditor.modeSidebars, {
    mode: STYLEGUIDE_MODE_ID,
    component: StyleguideSidebar,
  });
}
