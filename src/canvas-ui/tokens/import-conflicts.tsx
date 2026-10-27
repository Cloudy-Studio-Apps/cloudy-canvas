import type { ImportChoice } from "@canvas";
import { SegmentedControl } from "@shared/ui/kit";

import type { ImportConflictsProps } from "./tokens.types";
import { t } from "./tokens.i18n";

const CHOICES = [
  {
    value: "replace",
    label: t("choices.replace"),
    title: t("choices.replaceHint"),
  },
  {
    value: "keep-both",
    label: t("choices.keepBoth"),
    title: t("choices.keepBothHint"),
  },
  { value: "skip", label: t("choices.skip"), title: t("choices.skipHint") },
] as const satisfies readonly { value: ImportChoice; label: string; title: string }[];

/** Variables and styles named like the file's (with other ids), and what to do with them. */
export function ImportConflicts({ names, choice, onChoice }: ImportConflictsProps) {
  if (names.length === 0) return null;
  const shown = names.slice(0, 6).join(", ");
  return (
    <div className="flex flex-col gap-2 rounded-md bg-muted p-2.5">
      <p className="text-xs">
        {t("conflicts.summary", { count: names.length })}{" "}
        <span className="text-muted-foreground">
          {shown}
          {names.length > 6 ? t("conflicts.more", { count: names.length - 6 }) : ""}
        </span>
      </p>
      <SegmentedControl
        label={t("conflicts.label")}
        value={choice}
        onChange={onChoice}
        options={CHOICES}
        size="sm"
        fullWidth
      />
    </div>
  );
}
