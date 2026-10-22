import type { ReactNode } from "react";

export interface PanelSectionProps {
  title: string;
  /** Controls on the right of the title (add, settings, …). */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export interface PanelIconButtonProps {
  label: string;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface PanelAddButtonProps {
  label: string;
  onClick?: () => void;
}
