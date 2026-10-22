import { Group } from "lucide-react";

import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designCanvas } from "../../design-points";
import { GroupKind } from "./group.kind";
import { pruneEmptyGroups } from "./group-nodes";
import { groupSelectTarget } from "./group-select-target";
import { resolveGroups } from "./resolve-groups";
import { useGroupCommands } from "./ui/use-group-commands";

/**
 * Groups: the kind, bounds that follow the children, selecting the group before what's in it,
 * removing groups left empty, the group (Ctrl+G) and ungroup (Ctrl+Shift+G) commands and their
 * context menu items.
 */
export const groupModule = defineModule({
  id: "group",
  // Empty groups are pruned after the core puts dropped nodes in their containers.
  requires: ["core"],
  register(host) {
    host.contribute(designCanvas.kinds, new GroupKind());
    host.contribute(designCanvas.resolveElements, resolveGroups);
    host.contribute(designCanvas.selectTarget, groupSelectTarget);
    host.contribute(designCanvas.onRemove, (doc) => pruneEmptyGroups(doc));
    host.contribute(designCanvas.onMoved, (doc) => pruneEmptyGroups(doc));
    host.contribute(
      designCanvas.hostCommands,
      { id: "group", label: "Group selection", keys: [{ key: "g", mod: true }] },
      { id: "ungroup", label: "Ungroup", keys: [{ key: "g", mod: true, shift: true }] },
    );

    host.contribute(designEditor.sessionHooks, { id: "group-commands", use: useGroupCommands });
    host.contribute(designEditor.layerIcons, { type: "group", icon: Group });
    host.contribute(designEditor.mainMenu, {
      id: "arrange",
      order: 35,
      label: "Arrange",
      items: [
        { command: "group", label: "Group selection" },
        { command: "ungroup", label: "Ungroup" },
      ],
    });
    host.contribute(designEditor.contextMenu, {
      id: "group",
      menu: "selection",
      items: [
        { command: "group", label: "Group selection" },
        { command: "ungroup", label: "Ungroup" },
      ],
    });
  },
});
