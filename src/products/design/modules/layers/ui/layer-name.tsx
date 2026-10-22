import { commitFieldProps, useCommitField } from "@canvas-ui";
import type { LayerNameProps } from "./layer-name.types";

/** A layer's name, or a field to rename it (Enter or blur keeps it, Escape cancels). */
export function LayerName({ name, editing, onRename, onDone }: LayerNameProps) {
  const field = useCommitField(name, (draft) => {
    const next = draft.trim();
    if (next) onRename(next);
  });
  const bindings = commitFieldProps<HTMLInputElement>(field, { selectOnFocus: true });

  if (!editing) return <span className="ml-1 min-w-0 flex-1 truncate">{name}</span>;
  return (
    <input
      aria-label="Layer name"
      autoFocus
      {...bindings}
      onBlur={() => {
        bindings.onBlur();
        onDone();
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        // Keys stay in the field (Delete mustn't delete the layer).
        event.stopPropagation();
        bindings.onKeyDown(event);
      }}
      className="ml-1 h-5 min-w-0 flex-1 rounded-xs border border-ring bg-surface px-1 text-sm outline-none"
    />
  );
}
