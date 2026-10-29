import { Spline } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { ConnectorOptions } from "./ui/connector-options";
import * as connectorApi from ".";
import { registerConnectorCanvas } from "./connector.canvas";

/**
 * Connectors: the kind, the tool (X) and its panel, and the hooks that keep them on what they're
 * attached to: their routes follow it, deleting it frees their ends, and copies attached to
 * something that wasn't copied come loose.
 */
export const connectorModule = defineModule({
  id: "connector",
  tier: "core",
  // Connectors follow whatever they're attached to, ER boxes included, so they're resolved last.
  after: ["er"],
  exports: { ...connectorApi },
  register(host) {
    registerConnectorCanvas(host);

    host.contribute(boardEditor.tools, {
      tool: "connector",
      element: "connector",
      icon: Spline,
      toolbar: { group: 1, order: 60 },
    });
    host.contribute(boardEditor.toolPanels, { tool: "connector", component: ConnectorOptions });
    host.contribute(boardEditor.selectionPanels, {
      type: "connector",
      component: ConnectorOptions,
    });
  },
});
