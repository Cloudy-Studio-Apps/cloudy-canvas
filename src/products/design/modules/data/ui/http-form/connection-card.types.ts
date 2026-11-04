import type { SettingValue } from "../../source";
import type { ConnectionTab } from "./connection-tabs.types";

export interface ConnectionCardProps {
  values: Record<string, SettingValue>;
  stored: ReadonlySet<string>;
  /** Opens the Connection dialog on a tab. */
  onOpen: (tab: ConnectionTab) => void;
}
