import { syncTokens } from "@canvas";
import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { allKinds, noNodes } from "@design/ui/modules/section-filters";
import { designMcpTools, designCanvas, designMigrations } from "../../design-points";
import { migrateLiveScales } from "./migrate-live-scales";
import { migrateVariableModes } from "./migrate-variable-modes";
import {
  DETACH_LAYERS_COMMAND,
  useDetachLayersCommand,
} from "./ui/usage/use-detach-layers-command";
import { exchangeTools, variableTools } from "./mcp";
import { BUILT_IN_TOKEN_FORMATS, tokenFormats } from "./exchange";
import { DESIGN_TOKEN_CONTEXT } from "../core";
import {
  useVariablesWindowCommand,
  VariableModesSection,
  StylesSection,
  VariablesSection,
  VariablesWindow,
} from "./ui";
import { t } from "./variables.i18n";

/**
 * Variables (Figma's): the document's collections, modes and variables, layers' fields bound to
 * them and kept up to date by the token sync (in every edit's undo step, before auto layout lays
 * out what they resized), the Variables section and table, and the agents' tools.
 */
export const variablesModule = defineModule({
  id: "variables",
  tier: "core",
  requires: ["core", "pages"],
  register(host) {
    host.contribute(designCanvas.afterEdit, (doc, change, kinds) =>
      syncTokens(doc, change, kinds, DESIGN_TOKEN_CONTEXT),
    );

    host.contribute(designMcpTools, {
      id: "variables",
      tools: () => [...variableTools, ...exchangeTools(() => host.get(tokenFormats))],
    });
    // Import and export: DTCG both ways, Tokens Studio in, code out (plugins add their own).
    host.contribute(tokenFormats, ...BUILT_IN_TOKEN_FORMATS);
    host.contribute(designMigrations, { id: "variable-modes", migrate: migrateVariableModes });
    host.contribute(designMigrations, { id: "live-scales", migrate: migrateLiveScales });
    host.contribute(
      designCanvas.hostCommands,
      { id: "openVariables", label: t("commands.open") },
      { id: DETACH_LAYERS_COMMAND, label: t("commands.detach") },
    );
    host.contribute(designEditor.sessionHooks, {
      id: "variables.detach-layers",
      use: useDetachLayersCommand,
    });
    host.contribute(designEditor.contextMenu, {
      id: "variables",
      menu: "selection",
      items: [
        {
          command: DETACH_LAYERS_COMMAND,
          label: t("commands.detach"),
          // Only while a selected layer uses a variable or a style.
          enabled: (_context, engine) =>
            engine
              .selectedIds()
              .some((id) => Object.keys(engine.getElement(id)?.bindings ?? {}).length > 0),
        },
      ],
    });
    host.contribute(designEditor.sessionHooks, {
      id: "variables-window",
      use: useVariablesWindowCommand,
    });
    host.contribute(designEditor.overlays, { id: "variables.window", component: VariablesWindow });
    host.contribute(designEditor.mainMenu, {
      id: "variables",
      order: 42,
      items: [
        { command: "openVariables", label: t("commands.open") },
        { command: DETACH_LAYERS_COMMAND, label: t("commands.detach") },
      ],
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
