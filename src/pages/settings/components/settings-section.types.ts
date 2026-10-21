import type { ReactNode } from "react";

export interface SettingsSectionProps {
  /** Used for the heading's id, so the section is labelled by it. */
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}
