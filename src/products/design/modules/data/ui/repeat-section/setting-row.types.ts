import type { ReactNode } from "react";

export interface SettingRowProps {
  label: string;
  /** The control (and any button after it). */
  children: ReactNode;
}
