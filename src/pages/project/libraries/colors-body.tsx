import { Swatch } from "@shared/ui/kit";
import { tokenGroupOf, tokenLeafOf } from "@canvas";
import type { ColorsBodyProps } from "./kind-body.types";
import { t } from "../project.i18n";

/** A library's colors: a swatch with its name and group. */
export function ColorsBody({ library }: ColorsBodyProps) {
  if (library.colors.length === 0)
    return <p className="text-sm text-muted-foreground">{t("libraries.empty.colors")}</p>;
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2">
      {library.colors.map((item) => (
        <div key={item.id} className="flex items-center gap-2 rounded-card border bg-surface p-2">
          <Swatch color={item.color} size="md" />
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium">{tokenLeafOf(item.name)}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {tokenGroupOf(item.name) || item.color.slice(0, 7).toUpperCase()}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
