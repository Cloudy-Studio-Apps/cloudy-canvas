import { syncTokens } from "@canvas";
import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { allKinds, noNodes } from "@design/ui/modules/section-filters";
import { designAgentTools, designCanvas, designMigrations } from "../../design-points";
import { migrateVariableModes } from "./migrate-variable-modes";
import { variableTools } from "./agent";
import { DESIGN_TOKEN_CONTEXT } from "../core";
import {
  useVariablesWindowCommand,
  VariableModesSection,
  StylesSection,
  VariablesSection,
  VariablesWindow,
} from "./ui";

/**
 * Variables (Figma's): the document's collections, modes and variables, layers' fields bound to
 * them and kept up to date by the token sync (in every edit's undo step, before auto layout lays
 * out what they resized), the Variables section and table, and the agents' tools.
 */
export const variablesModule = defineModule({
  id: "variables",
  requires: ["core", "pages"],
  register(host) {
    host.contribute(designCanvas.afterEdit, (doc, change, kinds) =>
      syncTokens(doc, change, kinds, DESIGN_TOKEN_CONTEXT),
    );

    host.contribute(designAgentTools, { id: "variables", tools: () => variableTools });
    host.contribute(designMigrations, { id: "variable-modes", migrate: migrateVariableModes });
    host.contribute(designCanvas.hostCommands, { id: "openVariables", label: "Variables…" });
    host.contribute(designEditor.sessionHooks, {
      id: "variables-window",
      use: useVariablesWindowCommand,
    });
    host.contribute(designEditor.overlays, { id: "variables.window", component: VariablesWindow });
    host.contribute(designEditor.mainMenu, {
      id: "variables",
      order: 42,
      items: [{ command: "openVariables", label: "Variables…" }],
    });

    host.contribute(
      designEditor.propertySections,
      { id: "variables", tab: "design", order: 15, when: noNodes, component: VariablesSection },
      { id: "styles", tab: "design", order: 16, when: noNodes, component: StylesSection },
      {
        id: "variable-modes",
        tab: "design",
        order: 45,
        when: allKinds((kind) => kind.container || kind.childHost),
        component: VariableModesSection,
      },
    );
  },
});
