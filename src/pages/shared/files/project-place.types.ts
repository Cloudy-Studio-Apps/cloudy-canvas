import type { FileInfo } from "@shared/core";

export interface ProjectPlaceProps {
  file: Pick<FileInfo, "projectId" | "path">;
  className?: string;
}
