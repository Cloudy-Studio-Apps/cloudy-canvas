import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { ofType } from "@design/ui/modules/section-filters";
import { designAgentTools, designCanvas } from "../../design-points";
import { autoLayoutTools } from "./auto-layout.agent-tools";
import { reorderDropped } from "./layout-drop";
import { relayoutAfterEdit } from "./relayout";
import { AutoLayoutSection } from "./ui/auto-layout-section";
import { showsSizing } from "./ui/in-auto-layout";
import { SizingSection } from "./ui/sizing-section";
import { useAutoLayoutCommands } from "./ui/use-auto-layout-commands";

const COMMANDS = [
  { command: "addAutoLayout", label: "Add auto layout" },
  { command: "removeAutoLayout", label: "Remove auto layout" },
];

/**
 * Auto layout: every edit lays the auto layout frames it reaches out again, in the same undo
 * step (the `afterEdit` hook), and a layer dragged into one takes the place it's dropped at.
 * Shift+A adds one and Alt+Shift+A removes it; the Auto layout and Resizing sections and the
 * agents' tools edit them.
 */
export const autoLayoutModule = defineModule({
  id: "auto-layout",
  requires: ["core", "frame"],
  register(host) {
    host.contribute(designCanvas.afterEdit, relayoutAfterEdit);
    host.contribute(designCanvas.onMoved, (doc, moved, _elements, kinds) =>
      reorderDropped(doc, moved, kinds),
    );
    host.contribute(
      designCanvas.hostCommands,
      {
        id: "addAutoLayout",
        label: "Add auto layout",
        keys: [{ code: "KeyA", shift: true, label: "A" }],
      },
      {
        id: "removeAutoLayout",
        label: "Remove auto layout",
        keys: [{ code: "KeyA", alt: true, shift: true, label: "A" }],
      },
    );
    host.contribute(designAgentTools, { id: "auto-layout", tools: () => autoLayoutTools });

    host.contribute(designEditor.sessionHooks, {
      id: "auto-layout-commands",
      use: useAutoLayoutCommands,
    });
    host.contribute(designEditor.propertySections, {
      id: "auto-layout",
      tab: "design",
      order: 32,
      when: ofType("frame"),
      component: AutoLayoutSection,
    });
    host.contribute(designEditor.propertySections, {
      id: "resizing",
      tab: "design",
      order: 31,
      when: ({ nodes, kinds, elements }) => showsSizing(nodes, kinds, elements),
      component: SizingSection,
    });
    host.contribute(designEditor.mainMenu, {
      id: "auto-layout",
      order: 35.5,
      label: "Auto layout",
      items: COMMANDS,
    });
    host.contribute(designEditor.contextMenu, {
      id: "auto-layout",
      menu: "selection",
      items: COMMANDS,
    });
  },
});
