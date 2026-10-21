import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentServerState } from "./agent-server-store.types";

export const useAgentServerStore = create<AgentServerState>()(
  persist(
    (set) => ({
      enabled: true,
      setEnabled: (enabled) => set({ enabled }),
    }),
    { name: "cloudy-canvas:agent-server" },
  ),
);
