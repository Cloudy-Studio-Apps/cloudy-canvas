import type { AgentConfigBase } from "@platform";

/** An agent app's JSON config file, which the app adds its server to under `mcpServers`. */
export interface AgentConfigFile {
  base: AgentConfigBase;
  /** The file's path inside `base`, one part per item; the app counts as installed when the first part exists. */
  path: readonly string[];
  /** The server's entry under `mcpServers`. */
  entry(url: string): unknown;
  /** What to do next, shown in the toast once it's added. */
  done: string;
}

/** `absent`: the app isn't installed; `ready`: it is, without the server; `installed`: it has it. */
export type AgentConfigState = "absent" | "ready" | "installed";

export interface AgentConfigInstall {
  /** `null` while it's being checked, or when the app has no config file the app can write. */
  state: AgentConfigState | null;
  install(): void;
}
