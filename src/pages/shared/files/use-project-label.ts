import type { FileInfo } from "@shared/core";
import { useProjectsStore } from "@shared/stores/projects-store";
import { projectLabel } from "./project-label";

/** `projectLabel` for a file, from the projects this device knows. */
export function useProjectLabel(file: Pick<FileInfo, "projectId" | "path">): string | null {
  const projects = useProjectsStore((state) => state.projects);
  return projectLabel(file, projects);
}
