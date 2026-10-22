import { Input } from "@shared/ui/components/ui/input";
import { commitFieldProps } from "./commit-field-props";
import { useCommitField } from "./use-commit-field";
import type { CommitInputProps } from "./commit-input.types";

/** Input that commits on blur or Enter and reverts on Escape. Shows the commit error as a tooltip. */
export function CommitInput({ value, onCommit, title, ...props }: CommitInputProps) {
  const bindings = commitFieldProps<HTMLInputElement>(useCommitField(value, onCommit));
  return <Input {...props} {...bindings} title={bindings.title ?? title} />;
}
