import { Checkbox, Swatch } from "@shared/ui/kit";
import type { FillGroupRowProps } from "./colors.types";

/** A color the file's layers use, with the near-duplicates merged into it and how often. */
export function FillGroupRow({ group, checked, onCheckedChange }: FillGroupRowProps) {
  const merged = group.members.slice(1);
  return (
    <div className="flex items-center gap-2.5 border-b border-border py-1.5">
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={`Use ${group.hex}`}
      />
      <Swatch color={group.hex} size="md" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-semibold">{group.hex}</span>
        {merged.length > 0 && (
          <span className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
            {merged.map((m) => (
              <Swatch key={m.hex} color={m.hex} size="xs" title={`${m.hex} · ${m.refs.length}`} />
            ))}
            merges {merged.length}
          </span>
        )}
      </div>
      <span className="text-xs text-muted-foreground">{group.count} uses</span>
    </div>
  );
}
