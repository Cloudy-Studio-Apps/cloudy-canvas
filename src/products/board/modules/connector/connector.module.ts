import { Spline } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardCanvas } from "../../board-points";
import { LINE_COLORS } from "../../palette";
import { ConnectorKind } from "./connector.kind";
import { ConnectorTool } from "./connector.tool";
import { detachConnectors } from "./detach-connectors";
import { prepareConnectorCopies } from "./prepare-connector-copies";
import { resolveConnectors } from "./resolve-connectors";
import { ConnectorOptions } from "./ui/connector-options";

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
  register(host) {
    host.contribute(boardCanvas.kinds, new ConnectorKind());
    host.contribute(boardCanvas.tools, {
      id: "connector",
      create: (ctx) => new ConnectorTool(ctx),
      keys: [{ key: "x" }],
    });
    host.contribute(boardCanvas.options, {
      connectorStyle: "elbow",
      connectorColor: LINE_COLORS[0].value,
      connectorColorToken: null,
      connectorStartHead: "none",
      connectorEndHead: "arrow",
    });
    host.contribute(boardCanvas.resolveElements, resolveConnectors);
    host.contribute(boardCanvas.onRemove, detachConnectors);
    host.contribute(boardCanvas.prepareCopies, prepareConnectorCopies);

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
