import type { ComponentProps } from "react";

import type { Button } from "@shared/ui/kit";

export type ImageChooseButtonProps = {
  /** Gets the chosen picture's asset id (already in the document). */
  onChoose: (assetId: string) => void;
  /** "Replace image…" instead of "Choose image…". */
  replace?: boolean;
  /** The file dialog's title (default "Choose an image"). */
  title?: string;
} & Omit<ComponentProps<typeof Button>, "onClick" | "children" | "title">;
