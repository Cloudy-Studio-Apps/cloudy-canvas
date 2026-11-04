import { ListRow } from "@shared/ui/kit";
import type { SuggestListProps } from "./suggest-list.types";

/**
 * Names or values offered under the field being typed in, in the page's flow (no popover, so it
 * works inside a dialog). A press doesn't take the focus from the field.
 */
export function SuggestList({ items, active, onPick }: SuggestListProps) {
  if (items.length === 0) return null;
  return (
    <div
      role="listbox"
      className="flex max-h-44 flex-col overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-popover"
    >
      {items.map((item, index) => (
        <ListRow
          key={item.value}
          role="option"
          aria-selected={index === active}
          size="md"
          selected={index === active}
          label={<span className="font-mono">{item.value}</span>}
          meta={item.hint}
          onMouseDown={(event) => event.preventDefault()}
          onSelect={() => onPick(item.value)}
        />
      ))}
    </div>
  );
}
