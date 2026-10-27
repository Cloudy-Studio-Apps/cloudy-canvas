import { ChangeText } from "./change-text";
import type { ChangelogGroupsProps } from "./changelog-groups.types";
import { t } from "./app-updates.i18n";

/** A version's changes: a heading per kind (New, Improved, Fixed) over its list. */
export function ChangelogGroups({ groups }: ChangelogGroupsProps) {
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <section key={group.kind} className="space-y-1.5">
          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t(`groups.${group.kind}`)}
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
            {group.items.map((item) => (
              <li key={item.line}>
                <ChangeText text={item.text} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
