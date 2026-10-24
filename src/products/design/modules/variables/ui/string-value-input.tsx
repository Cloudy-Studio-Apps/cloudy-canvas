import { Type } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import { FieldBox } from "@design/ui/components/panel";
import { cn } from "@shared/ui/kit";
import type { PlainValueInputProps } from "./variables-ui.types";

/** A text variable's value: typed, written on Enter or blur. */
export function StringValueInput({
  value,
  label,
  onChange,
  className,
}: PlainValueInputProps<string>) {
  return (
    <FieldBox className={cn("min-w-0 flex-1 gap-1.5 pl-2", className)}>
      <Type className="size-3.5 shrink-0 text-subtle-foreground" />
      <CommitInput
        aria-label={label}
        value={value}
        onCommit={onChange}
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-xs shadow-none"
      />
    </FieldBox>
  );
}
