import type { ReactNode } from "react";

export interface PanelSectionProps {
  title: string;
  /** Controls on the right of the title (add, search, …). */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export interface PanelIconButtonProps {
  label: string;
  children: ReactNode;
  active?: boolean;
}

export interface PanelAddButtonProps {
  label: string;
}
