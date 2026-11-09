import { Button } from "@shared/ui/kit";
import { LibraryStrip } from "@pages/shared/projects";
import { useProjectContext } from "../project-context";
import type { LibraryCardProps } from "./library-card.types";
import { libraryFacts } from "./library-facts";
import { LibraryMenu } from "./library-menu";
import { usedByText } from "./library-usage";
import { t } from "../project.i18n";

/** A library on the Libraries tab: its colors, a type sample, what it holds and who uses it. */
export function LibraryCard({ library }: LibraryCardProps) {
  const { manifest, nav, fileCount } = useProjectContext();
  const { entry } = library;
  const colors = library.colors.slice(0, 6).map((item) => item.color);
  const families = library.textStyles
    .map((style) => style.value.fontFamily)
    .filter((family): family is string => typeof family === "string")
    .slice(0, 2);
  const used = usedByText(entry, fileCount);

  return (
    <div className="flex flex-col gap-3 rounded-card border bg-surface p-3.5 shadow-soft transition-[box-shadow,border-color] duration-200 hover:border-border-strong hover:shadow-lifted">
      <LibraryStrip
        colors={colors.length > 0 ? colors : [manifest.color]}
        className="h-14 rounded-md"
      />
      <div className="flex items-baseline gap-2 text-2xl leading-none">
        {(families.length > 0 ? families : [undefined]).map((family, index) => (
          <span key={index} style={{ fontFamily: family }}>
            {t("libraries.aa")}
          </span>
        ))}
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="truncate text-sm font-semibold">{entry.name}</p>
        <p className="truncate text-xs text-muted-foreground">{libraryFacts(library)}</p>
        {used !== "" && <p className="truncate text-xs text-muted-foreground">{used}</p>}
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={() => nav.openLibrary(entry.id)}>
          {t("libraries.open")}
        </Button>
        <LibraryMenu library={library} />
      </div>
    </div>
  );
}
