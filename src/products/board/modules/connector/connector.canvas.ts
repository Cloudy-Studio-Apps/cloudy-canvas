import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { LINE_COLORS } from "../../palette";
import { ConnectorKind } from "./connector.kind";
import { ConnectorTool } from "./connector.tool";
import { detachConnectors } from "./detach-connectors";
import { prepareConnectorCopies } from "./prepare-connector-copies";
import { resolveConnectors } from "./resolve-connectors";

/** The connector module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerConnectorCanvas(host: ModuleHost): void {
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
}
