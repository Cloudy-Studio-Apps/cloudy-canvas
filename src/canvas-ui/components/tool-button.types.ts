import type { IconButtonProps } from "@shared/ui/kit";

export interface ToolButtonProps extends Omit<IconButtonProps, "size" | "tooltip"> {
  /** Where the tooltip opens. */
  side?: "top" | "right" | "bottom" | "left";
}
