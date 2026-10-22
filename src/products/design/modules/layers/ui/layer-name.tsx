import type { LayerNameProps } from "./layer-name.types";

/** A layer's name, or a field to rename it (Enter or blur keeps it, Escape cancels). */
export function LayerName({ name, editing, onRename, onDone }: LayerNameProps) {
  if (!editing) return <span className="ml-1 min-w-0 flex-1 truncate">{name}</span>;
  return (
    <input
      aria-label="Layer name"
      defaultValue={name}
      autoFocus
      onFocus={(event) => event.currentTarget.select()}
      onClick={(event) => event.stopPropagation()}
      onBlur={(event) => {
        const next = event.currentTarget.value.trim();
        if (next && next !== name) onRename(next);
        onDone();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          event.currentTarget.value = name;
          event.currentTarget.blur();
        }
      }}
      className="ml-1 h-5 min-w-0 flex-1 rounded-xs border border-ring bg-surface px-1 text-sm outline-none"
    />
  );
}
