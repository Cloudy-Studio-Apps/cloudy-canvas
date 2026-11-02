import { isTauri } from "@tauri-apps/api/core";

import { isAndroidPlatform, type AgentChannel } from "@shared/core";
import { TauriAgentChannel } from "./tauri-agent-channel";

/**
 * Agent requests for the current platform; `null` where the app can't listen (browser dev, web)
 * or there are no local agents to connect (Android).
 */
export const agentChannel: AgentChannel | null =
  isTauri() && !isAndroidPlatform() ? new TauriAgentChannel() : null;
