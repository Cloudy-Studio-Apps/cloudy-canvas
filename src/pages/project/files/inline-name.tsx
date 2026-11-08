import { CommitInput } from "@canvas-ui";
import { cn } from "@shared/ui/kit";
import { useProjectContext } from "../project-context";
import { renameError } from "../project-rel";
import type { InlineNameProps } from "./inline-name.types";

/** A file's or folder's name; it becomes a field while the page is renaming it. */
export function InlineName({ entry, label, fixed, className }: InlineNameProps) {
  const { renaming, setRenaming, actions } = useProjectContext();
  if (fixed || renaming !== entry.rel) {
    return <span className={cn("block truncate", className)}>{label}</span>;
  }
  return (
    <CommitInput
      autoFocus
      value={label}
      aria-label={label}
      className="h-control-sm px-1.5 text-sm"
      onFocus={(event) => event.currentTarget.select()}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onBlur={() => setRenaming(null)}
      onCommit={(value) => {
        const error = renameError(value);
        if (error) return error;
        void actions.rename(entry, value);
      }}
    />
  );
}
