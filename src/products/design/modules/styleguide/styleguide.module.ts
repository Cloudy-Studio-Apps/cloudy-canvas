import { defineModule } from "@shared/core";
import { registerDesignMode } from "@design/ui/modules";
import { designMcpTools } from "../../design-points";
import { BUILT_IN_CATEGORIES } from "./categories";
import { styleguideTools } from "./mcp";
import { registerStyleguideCanvas } from "./styleguide.canvas";
import { registerStyleguideCommands } from "./styleguide.commands";
import { styleguideMode } from "./styleguide.mode";
import { styleguideCategories, styleguideTemplates } from "./styleguide.points";
import { registerStyleguideSections } from "./styleguide.sections";
import { BUILT_IN_TEMPLATES } from "./templates";
import * as styleguideApi from ".";
import * as styleguideUi from "./ui";

/**
 * The Design system: the view (a mode over a hidden page holding one live element per category,
 * `styleguide.mode.ts`) and live elements on any page (`styleguide.canvas.ts`), generated from the
 * file's variables and styles by templates; its commands, menus and sections are in
 * `styleguide.commands.ts` and `styleguide.sections.ts`.
 */
export const styleguideModule = defineModule({
  id: "styleguide",
  tier: "feature",
  requires: ["core", "pages", "frame", "text", "variables", "auto-layout"],
  after: ["variables"],
  exports: { ...styleguideApi, ...styleguideUi },
  register(host) {
    host.contribute(styleguideCategories, ...BUILT_IN_CATEGORIES);
    host.contribute(styleguideTemplates, ...BUILT_IN_TEMPLATES);
    registerStyleguideCanvas(host);

    host.contribute(designMcpTools, {
      id: "styleguide",
      tools: () =>
        styleguideTools({
          categories: () => host.get(styleguideCategories),
          templates: () => host.get(styleguideTemplates),
        }),
    });

    registerDesignMode(host, styleguideMode);
    registerStyleguideCommands(host);
    registerStyleguideSections(host);
  },
});
