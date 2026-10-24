import { commitFieldProps, useCommitField } from "@canvas-ui";
import { FieldBox, sharedValue } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import { formatDashes, parseDashes } from "./stroke-dashes";
import type { DashPatternFieldProps } from "./dash-pattern-field.types";

/** A custom dash pattern typed as lengths ("8, 4, 2, 4"): dash, gap, dash, gap… */
export function DashPatternField({ nodes }: DashPatternFieldProps) {
  const edit = useEditNodes();
  const shared = sharedValue(nodes, (node) => formatDashes(node.strokeDashes));
  const field = useCommitField(shared ?? "", (draft) => {
    const dashes = parseDashes(draft);
    if (dashes === null) return "Enter lengths, e.g. 8, 4";
    edit(nodes, () => ({ strokeDashes: dashes }));
  });
  const bindings = commitFieldProps<HTMLInputElement>(field, { selectOnFocus: true });
  return (
    <FieldBox title={bindings.title ?? "Dash pattern"} invalid={!!field.error}>
      <span className="shrink-0 text-subtle-foreground">Pattern</span>
      {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a bare input inside its FieldBox */}
      <input
        aria-label="Dash pattern"
        placeholder={shared === null ? "Mixed" : "dash, gap, …"}
        {...bindings}
        className="min-w-0 flex-1 bg-transparent text-foreground tabular-nums outline-none placeholder:text-subtle-foreground"
      />
    </FieldBox>
  );
}
