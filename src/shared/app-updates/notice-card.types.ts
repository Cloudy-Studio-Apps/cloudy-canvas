import type { ReactNode } from "react";

export interface NoticeCardProps {
  title: string;
  description: string;
  /** The buttons or the progress bar below the text. */
  children: ReactNode;
}
