import { isTauri } from "@tauri-apps/api/core";

import type { AgentChannel } from "@shared/core";
import { TauriAgentChannel } from "./tauri-agent-channel";

/** Agent requests for the current platform; `null` where the app can't listen (browser dev, web). */
export const agentChannel: AgentChannel | null = isTauri() ? new TauriAgentChannel() : null;
