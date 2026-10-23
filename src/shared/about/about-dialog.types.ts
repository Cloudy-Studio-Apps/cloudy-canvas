import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface AboutBlockProps {
  title: string;
  children: ReactNode;
}

export interface LinkButtonProps {
  href: string;
  /** Shown before the label; an external-link mark always follows it. */
  icon?: LucideIcon;
  children: ReactNode;
}
