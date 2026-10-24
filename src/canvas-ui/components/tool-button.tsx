import { IconButton } from "@shared/ui/kit";
import type { ToolButtonProps } from "./tool-button.types";

/** A toolbar's icon button: the kit's `IconButton` at toolbar size, its tooltip on `side`. */
export function ToolButton({ side = "top", ...props }: ToolButtonProps) {
  return <IconButton size="lg" tooltip={side} {...props} />;
}
