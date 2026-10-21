import type { ReactNode } from "react";

export interface FormFieldProps {
  label: string;
  children: ReactNode;
}

export interface FormSectionProps {
  title: string;
  /** Buttons shown at the right of the title. */
  actions?: ReactNode;
  children: ReactNode;
}
