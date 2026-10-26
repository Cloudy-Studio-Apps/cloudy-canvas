// Connectors: lines whose ends are free or attached to connectable elements, plus the quick
// connect dots other kinds extend. The module (`connector.module.ts`) registers the kind, the
// tool (X), its panel and the hooks that keep connectors attached.
export type * from "./connector.types";
export type * from "./connector-options.types";
export { createConnector } from "./connector.factory";
export { ConnectorKind } from "./connector.kind";
export { CONNECTOR_DEFAULTS } from "./connector.defaults";
export { SIDE_DIRECTIONS, SIDES } from "./sides";
export { ConnectorDrag } from "./connector-drag";
export { QuickConnectKind } from "./quick-connect.kind";
export { connectableAt } from "./connectable-at";
export { connectorEndpoints } from "./connector-endpoints";
export { detachConnectors } from "./detach-connectors";
export { isConnector } from "./is-connector";
export { resolveConnectors } from "./resolve-connectors";
export { prepareConnectorCopies } from "./prepare-connector-copies";
export { ConnectorTool } from "./connector.tool";
