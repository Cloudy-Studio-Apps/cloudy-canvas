import { LayoutTemplate, Palette } from "lucide-react";

import { TokenStore } from "@canvas";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import type { DesignToolOptions } from "../../design-options.types";
import { designAgentTools, designCanvas, designSelectRedirects } from "../../design-points";
import { styleguideTools } from "./agent";
import { BUILT_IN_CATEGORIES } from "./categories";
import {
  STYLEGUIDE_COMMANDS,
  STYLEGUIDE_MODE,
  STYLEGUIDE_MODE_ID,
  STYLEGUIDE_TOOL,
  StyleguideTool,
} from "./mode";
import { TOKEN_SHEET_TOOL, TokenSheetTool } from "./tool";
import { styleguideCategories, styleguideTemplates } from "./styleguide-points";
import { syncStyleguide } from "./system";
import { BUILT_IN_TEMPLATES } from "./templates";
import { StyleguideEmpty } from "./ui/empty/styleguide-empty";
import { useStyleguideCommands } from "./ui/hooks/use-styleguide-commands";
import { STYLEGUIDE_MENU } from "./ui/menus/styleguide-menu";
import { useStyleguideScope } from "./ui/hooks/use-styleguide-scope";
import { useStyleguideSelection } from "./ui/hooks/use-styleguide-selection";
import { SheetSection } from "./ui/sidebar/sheet-section";
import { StyleguideSidebar } from "./ui/sidebar/styleguide-sidebar";
import { StyleguideTab } from "./ui/tab/styleguide-tab";
import { isSheet, prepareSheetCopies, sheetRedirect } from "./sheet";

/**
 * The Design system: the view (a mode over a hidden page holding one live element per category)
 * and live elements on any page, generated from the file's variables and styles by templates.
 */
export const styleguideModule = defineModule({
  id: "styleguide",
  requires: ["core", "pages", "frame", "text", "variables", "auto-layout"],
  after: ["variables"],
  register(host) {
    host.contribute(styleguideCategories, ...BUILT_IN_CATEGORIES);
    host.contribute(styleguideTemplates, ...BUILT_IN_TEMPLATES);
    // A click on what a template generated selects the element it belongs to.
    host.contribute(designSelectRedirects, sheetRedirect);
    // A generated layer copied on its own pastes as an ordinary layer.
    host.contribute(designCanvas.prepareCopies, prepareSheetCopies);

    // Read when an edit settles: every module has contributed by then.
    let options: DesignToolOptions | null = null;
    const sources = {
      categories: () => host.get(styleguideCategories),
      template: (id: string) => host.find(styleguideTemplates, id),
      options: () =>
        (options ??= Object.assign({}, ...host.get(designCanvas.options)) as DesignToolOptions),
    };
    // The system page and every live element follow the tokens, in the edit's undo step.
    host.contribute(designCanvas.afterEdit, (doc, change, kinds) =>
      syncStyleguide(doc, change, kinds, sources),
    );

    host.contribute(designAgentTools, {
      id: "styleguide",
      tools: () =>
        styleguideTools({
          categories: () => host.get(styleguideCategories),
          templates: () => host.get(styleguideTemplates),
        }),
    });

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

    // Commands: the view, converting, exporting.
    host.contribute(
      designCanvas.hostCommands,
      { id: STYLEGUIDE_COMMANDS.open, label: "Design system" },
      { id: STYLEGUIDE_COMMANDS.convert, label: "Convert to design" },
      { id: STYLEGUIDE_COMMANDS.exportSection, label: "Export this section…" },
      { id: STYLEGUIDE_COMMANDS.exportSystem, label: "Export the design system as PDF" },
    );
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

    // Live elements on any page: the tool places one with the first category that has tokens.
    host.contribute(designCanvas.tools, {
      id: TOKEN_SHEET_TOOL,
      create: (ctx) =>
        new TokenSheetTool(ctx, () => {
          const store = TokenStore.of(ctx.doc);
          const categories = host.get(styleguideCategories);
          const first =
            categories.find((c) => !c.untitled && c.groups(store, ctx.doc).length > 0) ??
            categories.find((c) => !c.untitled) ??
            categories[0];
          return first ?? { id: "colors", label: "Colors" };
        }),
      keys: [{ key: "d", shift: true }],
    });
    host.contribute(designEditor.tools, {
      tool: TOKEN_SHEET_TOOL,
      label: "Design system",
      description: "Place your variables and styles as a live style guide that stays up to date.",
      icon: LayoutTemplate,
      toolbar: { group: 1, order: 14, menu: "frames" },
    });
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
    // A live element on a page: what it shows, its template, Convert to design.
    host.contribute(designEditor.propertySections, {
      id: "styleguide.sheet",
      tab: "design",
      order: 5,
      when: (selection) => selection.nodes.length > 0 && selection.nodes.every(isSheet),
      component: SheetSection,
    });
  },
});
