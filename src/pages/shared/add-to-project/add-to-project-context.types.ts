import type * as React from "react";

import type { FileInfo, ProjectRecord } from "@shared/core";

/** Opens the Add to project dialog for a file. */
export type AddToProjectRequest = (file: FileInfo) => void;

export interface AddToProjectProviderProps {
  children: React.ReactNode;
  /** The project files go to, fixed (the project home); otherwise each is picked in the dialog. */
  project?: ProjectRecord;
  /** The folder offered first. */
  folder?: string;
  /** A file is in the project now. */
  onAdded?: (file: FileInfo, project: ProjectRecord) => void;
}
