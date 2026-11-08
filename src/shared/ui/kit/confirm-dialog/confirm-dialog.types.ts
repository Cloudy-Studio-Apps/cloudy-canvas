import type * as React from "react";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The confirming button's text. */
  confirmLabel: string;
  /** Draws the confirming button in the destructive color. */
  destructive?: boolean;
  /** Runs when confirmed; the dialog closes. */
  onConfirm: () => void;
}
