import type { ComponentProps } from "react";

import type { CommitHandler } from "./use-commit-field.types";

export interface CommitInputProps extends Omit<ComponentProps<"input">, "value" | "onChange"> {
  value: string;
  onCommit: CommitHandler;
}

export interface CommitTextareaProps extends Omit<
  ComponentProps<"textarea">,
  "value" | "onChange"
> {
  value: string;
  onCommit: CommitHandler;
}
