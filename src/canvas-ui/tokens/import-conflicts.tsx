import type { ImportChoice } from "@canvas";
import { SegmentedControl } from "@shared/ui/kit";

import type { ImportConflictsProps } from "./tokens.types";

const CHOICES = [
  {
    value: "replace",
    label: "Replace",
    title: "The file's keep their place and take the new values",
  },
  {
    value: "keep-both",
    label: "Keep both",
    title: "The new ones are added with a number after their name",
  },
  { value: "skip", label: "Skip", title: "The file's stay as they are" },
] as const satisfies readonly { value: ImportChoice; label: string; title: string }[];

/** Variables and styles named like the file's (with other ids), and what to do with them. */
export function ImportConflicts({ names, choice, onChoice }: ImportConflictsProps) {
  if (names.length === 0) return null;
  const shown = names.slice(0, 6).join(", ");
  return (
    <div className="flex flex-col gap-2 rounded-md bg-muted p-2.5">
      <p className="text-xs">
        {names.length === 1 ? "1 is" : `${names.length} are`} named like ones this file has:{" "}
        <span className="text-muted-foreground">
          {shown}
          {names.length > 6 ? ` and ${names.length - 6} more` : ""}
        </span>
      </p>
      <SegmentedControl
        label="Same names"
        value={choice}
        onChange={onChoice}
        options={CHOICES}
        size="sm"
        fullWidth
      />
    </div>
  );
}
