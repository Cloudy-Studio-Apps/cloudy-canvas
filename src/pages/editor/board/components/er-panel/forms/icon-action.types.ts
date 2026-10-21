import type { ReactNode } from "react";

export interface IconActionProps {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}
