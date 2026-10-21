import type { ComponentProps } from "react";

export interface OptionButtonProps extends ComponentProps<"button"> {
  selected: boolean;
}
