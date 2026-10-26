import { Pencil } from "lucide-react";
import { useState } from "react";

import { CommitInput } from "@canvas-ui";
import { IconButton } from "@shared/ui/kit";
import type { InlineRenameProps } from "./colors-ui.types";

/** A header's rename: a pencil that turns into a name field until it's committed or left. */
export function InlineRename({ label, value, onRename }: InlineRenameProps) {
  const [editing, setEditing] = useState(false);
  if (!editing) {
    return (
      <IconButton label={label} size="xs" revealOnHover onClick={() => setEditing(true)}>
        <Pencil />
      </IconButton>
    );
  }
  return (
    <CommitInput
      autoFocus
      aria-label={label}
      value={value}
      onCommit={(text) => {
        const name = text.trim();
        if (name && name !== value) onRename(name);
        setEditing(false);
      }}
      onBlur={() => setEditing(false)}
      className="h-6 w-28 rounded-md bg-muted px-1 text-xs focus:outline-none"
    />
  );
}
