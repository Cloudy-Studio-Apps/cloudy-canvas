import { LibraryCard } from "./library-card";
import type { LibrarySectionViewProps } from "./library.types";

/** A titled block of items. */
export function LibrarySectionView({ section, items, onPick }: LibrarySectionViewProps) {
  return (
    <section aria-label={section.title} className="rounded-card bg-surface-sunken p-3">
      <h3 className="text-sm font-semibold">{section.title}</h3>
      <p className="text-xs text-muted-foreground">{section.description}</p>
      <div className="mt-2 grid grid-cols-4 gap-1">
        {items.map((item) => (
          <LibraryCard key={item.id} item={item} onPick={onPick} />
        ))}
      </div>
    </section>
  );
}
