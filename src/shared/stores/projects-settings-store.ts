import { create } from "zustand";
import { persist } from "zustand/middleware";

import { defaultProjectsFolder } from "@platform";
import type { ProjectsSettingsState } from "./projects-settings-store.types";

/** Settings › Projects & storage: where new projects go. */
export const useProjectsSettingsStore = create<ProjectsSettingsState>()(
  persist(
    (set) => ({
      projectsFolder: null,
      setProjectsFolder: (projectsFolder) => set({ projectsFolder }),
    }),
    { name: "cloudy-canvas:projects" },
  ),
);

/** The folder new projects go to: the one chosen in Settings, else the default. */
export async function resolveProjectsFolder(): Promise<string> {
  return useProjectsSettingsStore.getState().projectsFolder ?? defaultProjectsFolder();
}
