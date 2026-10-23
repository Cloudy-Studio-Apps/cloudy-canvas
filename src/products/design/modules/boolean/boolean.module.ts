import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { ofType } from "@design/ui/modules/section-filters";
import { designAgentTools, designCanvas } from "../../design-points";
import { pruneEmptyHosts } from "../core";
import { BOOLEAN_OPERATIONS, BOOLEAN_TYPE } from "./boolean.constants";
import type { BooleanElement } from "./boolean.types";
import { booleanTools } from "./boolean.agent-tools";
import { BooleanKind } from "./boolean.kind";
import { BooleanSection } from "./ui/boolean-section";
import { BooleanToolbarMenu } from "./ui/boolean-toolbar-menu";
import { BOOLEAN_COMMANDS, BOOLEAN_ICONS } from "./ui/boolean-icons";
import { useBooleanCommands } from "./ui/use-boolean-commands";

const BOOLEAN_TYPES: ReadonlySet<string> = new Set([BOOLEAN_TYPE]);
/** Figma's keys: Alt+Shift+U, S, I and E. */
const KEYS = { union: "KeyU", subtract: "KeyS", intersect: "KeyI", exclude: "KeyE" } as const;

/**
 * Booleans: the kind (resolved from its operands by the core's tree resolver, which hides them),
 * the four operations, Flatten and Outline stroke as commands with Figma's keys, their menus, the
 * Boolean section, the layer icons and the agent tools. Booleans emptied of operands are removed.
 */
export const booleanModule = defineModule({
  id: "boolean",
  // Flatten and Outline stroke make vectors.
  requires: ["core", "vector"],
  register(host) {
    host.contribute(designCanvas.kinds, new BooleanKind());
    host.contribute(designCanvas.onRemove, (doc) => pruneEmptyHosts(doc, BOOLEAN_TYPES));
    host.contribute(designCanvas.onMoved, (doc) => pruneEmptyHosts(doc, BOOLEAN_TYPES));
    host.contribute(
      designCanvas.hostCommands,
      ...BOOLEAN_OPERATIONS.map(({ operation, label }) => ({
        id: BOOLEAN_COMMANDS[operation],
        label,
        keys: [{ code: KEYS[operation], alt: true, shift: true, label: KEYS[operation].slice(3) }],
      })),
      { id: "flatten", label: "Flatten", keys: [{ key: "e", mod: true }] },
      {
        id: "outlineStroke",
        label: "Outline stroke",
        keys: [{ key: "o", mod: true, shift: true }],
      },
    );
    host.contribute(designAgentTools, { id: "boolean", tools: () => booleanTools });

    host.contribute(designEditor.sessionHooks, { id: "boolean-commands", use: useBooleanCommands });
    host.contribute(designEditor.selectionActions, {
      id: "boolean",
      order: 20,
      component: BooleanToolbarMenu,
    });
    host.contribute(designEditor.layerIcons, {
      type: BOOLEAN_TYPE,
      icon: BOOLEAN_ICONS.union,
      iconOf: (node) => BOOLEAN_ICONS[(node as BooleanElement).operation],
    });
    host.contribute(designEditor.propertySections, {
      id: "boolean",
      tab: "design",
      order: 16,
      // Booleans, or two or more layers to combine.
      when: (selection) => selection.nodes.length >= 2 || ofType(BOOLEAN_TYPE)(selection),
      component: BooleanSection,
    });
    const items = [
      ...BOOLEAN_OPERATIONS.map(({ operation, label }) => ({
        command: BOOLEAN_COMMANDS[operation],
        label,
      })),
      { command: "flatten", label: "Flatten" },
      { command: "outlineStroke", label: "Outline stroke" },
    ];
    host.contribute(designEditor.mainMenu, { id: "boolean", order: 35.7, label: "Boolean", items });
    host.contribute(designEditor.contextMenu, {
      id: "boolean",
      menu: "selection",
      label: "Boolean",
      items,
    });
  },
});
