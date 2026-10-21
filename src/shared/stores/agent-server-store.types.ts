export interface AgentServerState {
  /** Agents may connect to the local MCP endpoint. On by default. */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}
