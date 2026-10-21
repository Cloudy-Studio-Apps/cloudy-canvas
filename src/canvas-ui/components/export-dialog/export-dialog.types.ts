import type { ReactNode } from "react";

export interface ExportDialogProps {
  /** The exported file's name without its extension, e.g. the board's name. */
  name: string;
}

/** A label beside the control it names, as one row of the dialog. */
export interface ExportFieldProps {
  label: string;
  id?: string;
  children: ReactNode;
}
