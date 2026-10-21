import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import type { AgentChannel, AgentMessage, AgentServerStatus } from "@core";

/** Messages from the local MCP endpoint in the Tauri shell (`src-tauri/src/mcp`). */
export class TauriAgentChannel implements AgentChannel {
  listen(handler: (message: AgentMessage) => void): Promise<() => void> {
    return listen<AgentMessage>("mcp://message", (event) => handler(event.payload));
  }

  reply(id: number, body: string): Promise<void> {
    return invoke("mcp_reply", { id, body });
  }

  status(): Promise<AgentServerStatus> {
    return invoke<AgentServerStatus>("mcp_status");
  }

  setEnabled(enabled: boolean): Promise<void> {
    return invoke("mcp_set_enabled", { enabled });
  }
}
