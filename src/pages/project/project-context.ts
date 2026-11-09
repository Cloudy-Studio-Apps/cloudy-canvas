import { createContext, useContext } from "react";

import type { ProjectContextValue } from "./project-context.types";

export const ProjectContext = createContext<ProjectContextValue | null>(null);

/** The project the page shows; only inside `ProjectPage`. */
export function useProjectContext(): ProjectContextValue {
  const value = useContext(ProjectContext);
  if (!value) throw new Error("useProjectContext needs a ProjectContext provider");
  return value;
}

/** The drag id of a file or folder, and the drop id of a folder. */
export const dragId = (kind: "file" | "folder", rel: string) => `${kind}:${rel}`;

/** The path in a drag id. */
export const relOfDragId = (id: string) => id.slice(id.indexOf(":") + 1);
