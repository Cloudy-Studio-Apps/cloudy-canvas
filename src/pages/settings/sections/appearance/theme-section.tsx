import type { ThemeSectionProps } from "./appearance.types";
import { ThemeFamilyCard } from "./theme-family-card";

/** A heading (a plugin's name) over its theme families' cards. */
export function ThemeSection({ heading, families, ...cardProps }: ThemeSectionProps) {
  return (
    <div className="space-y-2">
      {heading && <p className="text-xs font-medium text-muted-foreground">{heading}</p>}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] items-start gap-3">
        {families.map((family) => (
          <ThemeFamilyCard key={family.key} family={family} {...cardProps} />
        ))}
      </div>
    </div>
  );
}
