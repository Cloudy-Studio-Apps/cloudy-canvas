import type { ConnectionTabProps } from "./connection-tab.types";

export interface AuthTabProps extends ConnectionTabProps {
  /** The secrets this device keeps for the source (`apiKey`, `token`, `password`). */
  stored: ReadonlySet<string>;
}
