import type { ProjectRecord } from "@shared/core";

export interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The project was created (and recorded as opened). */
  onCreated: (project: ProjectRecord) => void;
}
