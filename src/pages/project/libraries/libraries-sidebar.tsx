import { LayoutGrid, Plus } from "lucide-react";

import { IconButton, ListRow } from "@shared/ui/kit";
import { LibraryStrip } from "@pages/shared/projects";
import { useProjectContext } from "../project-context";
import { LIBRARY_KINDS } from "./library-kinds";
import { totalCounts } from "./library-summary";
import { t } from "../project.i18n";

/** The sidebar's Libraries section (All libraries, one row per library, New library) and Content section. */
export function LibrariesSidebar() {
  const { tab, libraryId, kind, libs, manifest, nav, setNewLibraryOpen } = useProjectContext();
  const totals = totalCounts(libs.summaries);

  return (
    <>
      <section className="space-y-0.5">
        <div className="flex h-6 items-center justify-between pl-2 text-xs font-medium text-muted-foreground">
          {t("libraries.sidebar")}
          <IconButton label={t("libraries.new")} size="xs" onClick={() => setNewLibraryOpen(true)}>
            <Plus />
          </IconButton>
        </div>
        <ListRow
          selected={tab === "libraries" && libraryId === null}
          onSelect={() => nav.openLibrary(null)}
          icon={<LayoutGrid />}
          label={t("libraries.all")}
          meta={libs.summaries.length}
        />
        {libs.summaries.map((library) => {
          const colors = library.colors.slice(0, 3).map((item) => item.color);
          const count =
            library.colors.length +
            library.textStyles.length +
            library.images.length +
            library.svgs.length +
            library.effects.length;
          return (
            <ListRow
              key={library.entry.id}
              selected={tab === "libraries" && libraryId === library.entry.id}
              onSelect={() => nav.openLibrary(library.entry.id)}
              icon={
                <LibraryStrip
                  colors={colors.length > 0 ? colors : [manifest.color]}
                  className="h-3.5 w-6 rounded-sm"
                />
              }
              label={library.entry.name}
              meta={count}
            />
          );
        })}
      </section>
      <section className="space-y-0.5">
        <div className="flex h-6 items-center pl-2 text-xs font-medium text-muted-foreground">
          {t("libraries.content")}
        </div>
        {LIBRARY_KINDS.map(({ kind: item, icon: Icon }) => (
          <ListRow
            key={item}
            selected={tab === "content" && kind === item}
            onSelect={() => nav.openKind(item)}
            icon={<Icon />}
            label={t(`kinds.${item}`)}
            meta={totals[item]}
          />
        ))}
      </section>
    </>
  );
}
