import type * as React from "react";

export type AppDialogSize = "sm" | "md" | "lg" | "xl";

export interface AppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Buttons at the bottom right (the main one last). */
  footer?: React.ReactNode;
  /** Its width: sm 384, md 512, lg 640, xl 800 px. */
  size?: AppDialogSize;
  /** Classes for the body (its padding, a scroll). */
  bodyClassName?: string;
  className?: string;
}
