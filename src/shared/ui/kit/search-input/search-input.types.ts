import type * as React from "react";

export interface SearchInputProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "size"
> {
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
}
