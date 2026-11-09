import { createContext, useContext } from "react";

import type { ProjectLibrariesState } from "./use-project-libraries.types";

/** A file with no project (and a live guest's file): no libraries. */
export const NO_PROJECT_LIBRARIES: ProjectLibrariesState = {
  status: "none",
  projectId: null,
  project: null,
  hub: null,
  libraries: [],
  locate: () => Promise.resolve(),
};

/** The open file's project libraries (`useProjectLibraries`), for the editor chrome. */
export const ProjectLibrariesContext = createContext<ProjectLibrariesState>(NO_PROJECT_LIBRARIES);

export function useProjectLibrariesState(): ProjectLibrariesState {
  return useContext(ProjectLibrariesContext);
}
