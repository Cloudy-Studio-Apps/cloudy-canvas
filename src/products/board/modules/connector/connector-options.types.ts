import type { ArrowHead, ConnectorStyle } from "./connector.types";

/** The connector tool's options, for new connectors and the selected ones. */
export interface ConnectorToolOptions {
  connectorStyle: ConnectorStyle;
  connectorColor: string;
  /** The color variable the color is bound to (`null`: the color as picked). */
  connectorColorToken: string | null;
  connectorStartHead: ArrowHead;
  connectorEndHead: ArrowHead;
}
