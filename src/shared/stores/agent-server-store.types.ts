export interface AgentServerState {
  /** Agents may connect to the local MCP endpoint. On by default. */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  /** Collaborators' cursors and selections show on the canvas. On by default. */
  showCollaborators: boolean;
  setShowCollaborators: (show: boolean) => void;
}
