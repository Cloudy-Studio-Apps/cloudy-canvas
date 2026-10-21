export interface AgentServerStatusView {
  /** The app can serve agents here (desktop); `false` in a browser. */
  available: boolean;
  enabled: boolean;
  url: string | null;
  setEnabled: (enabled: boolean) => void;
  refresh: () => void;
}
