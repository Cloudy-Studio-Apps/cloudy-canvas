import type { ArrowHead, ConnectorStyle } from "./connector.types";

/** The connector tool's options, for new connectors and the selected ones. */
export interface ConnectorToolOptions {
  connectorStyle: ConnectorStyle;
  connectorColor: string;
  connectorStartHead: ArrowHead;
  connectorEndHead: ArrowHead;
}
