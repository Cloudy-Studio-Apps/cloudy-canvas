import { LayoutTemplate } from "lucide-react";

import type { ModuleHost } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { STYLEGUIDE_COMMANDS } from "./mode";
import { isSheet } from "./sheet";
import { TOKEN_SHEET_TOOL } from "./tool";
import { useStyleguideCommands } from "./ui/hooks/use-styleguide-commands";
import { STYLEGUIDE_MENU } from "./ui/menus/styleguide-menu";
import { SheetSection } from "./ui/sidebar/sheet-section";

/**
 * The commands' session hook, the main and context menus, the live element tool's button and the
 * live element's section.
 */
export function registerStyleguideSections(host: ModuleHost): void {
  host.contribute(designEditor.sessionHooks, {
    id: "styleguide.commands",
    use: useStyleguideCommands,
  });
  host.contribute(designEditor.mainMenu, {
    id: "styleguide",
    order: 42.5,
    items: [{ command: STYLEGUIDE_COMMANDS.open, label: "Design system" }],
  });
  host.contribute(designEditor.contextMenu, STYLEGUIDE_MENU);
  host.contribute(designEditor.tools, {
    tool: TOKEN_SHEET_TOOL,
    label: "Design system",
    description: "Place your variables and styles as a live style guide that stays up to date.",
    icon: LayoutTemplate,
    toolbar: { group: 1, order: 14, menu: "frames" },
  });
  // A live element on a page: what it shows, its template, Convert to design.
  host.contribute(designEditor.propertySections, {
    id: "styleguide.sheet",
    tab: "design",
    order: 5,
    when: (selection) => selection.nodes.length > 0 && selection.nodes.every(isSheet),
    component: SheetSection,
  });
}
