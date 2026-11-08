import type { ClashChoice, MergePlan } from "@canvas";
import type { FileInfo, ProjectRecord } from "@shared/core";
import type { MergeLibrary } from "./merge-session.types";
import type { MergeSessionState } from "./use-merge-session.types";

export interface AddToProjectDialogProps {
  /** The file to add; the dialog is open while there is one. */
  file: FileInfo | null;
  /** The project it goes to, fixed (the project home); otherwise it's picked in the dialog. */
  project?: ProjectRecord;
  /** The folder offered first (relative to the project). */
  folder?: string;
  onClose: () => void;
  /** The file is in the project now. */
  onAdded?: (file: FileInfo, project: ProjectRecord) => void;
}

/** The dialog's state and what it does (`useAddToProjectForm`). */
export interface AddToProjectForm {
  /** The projects to pick from (only the fixed one when there is one). */
  projects: ProjectRecord[];
  project: ProjectRecord | null;
  pickProject: (id: string) => void;
  folders: string[];
  folder: string;
  setFolder: (rel: string) => void;
  libraries: MergeLibrary[];
  libraryId: string | null;
  setLibraryId: (id: string) => void;
  session: MergeSessionState;
  /** The plan for the chosen library, with the choices made so far. */
  plan: MergePlan | null;
  choose: (fileId: string, choice: ClashChoice) => void;
  /** The file says it's in a project already. */
  linked: boolean;
  busy: boolean;
  canAdd: boolean;
  add: () => Promise<void>;
}

export type AddToProjectFormOptions = Omit<AddToProjectDialogProps, "file"> & { file: FileInfo };
