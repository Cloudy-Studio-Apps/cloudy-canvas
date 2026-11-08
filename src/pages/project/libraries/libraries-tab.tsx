import { Plus } from "lucide-react";

import { Button, EmptyState } from "@shared/ui/kit";
import { useProjectContext } from "../project-context";
import { LibraryCard } from "./library-card";
import { LibraryPage } from "./library-page";
import { t } from "../project.i18n";

/** The Libraries tab: a card per library (and New library), or one library's page. */
export function LibrariesTab() {
  const { libraryId, libs, setNewLibraryOpen, nav } = useProjectContext();
  const current = libraryId ? libs.summaries.find((s) => s.entry.id === libraryId) : undefined;

  if (libraryId && !current) {
    return libs.loading ? null : (
      <EmptyState
        title={t("libraries.notFound")}
        action={
          <Button variant="outline" onClick={() => nav.openLibrary(null)}>
            {t("libraries.all")}
          </Button>
        }
        className="mx-auto max-w-md py-16"
      />
    );
  }
  if (current) return <LibraryPage library={current} />;

  return (
    <div className="space-y-4 p-6">
      <p className="max-w-2xl text-sm text-muted-foreground">{t("libraries.intro")}</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
        {libs.summaries.map((library) => (
          <LibraryCard key={library.entry.id} library={library} />
        ))}
        {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a dashed card that is the whole button */}
        <button
          type="button"
          onClick={() => setNewLibraryOpen(true)}
          className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-1 rounded-card border border-dashed p-3.5 text-sm text-muted-foreground outline-none hover:border-border-strong hover:bg-hover focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <Plus className="size-5" />
          <b className="text-foreground">{t("libraries.new")}</b>
          <span className="text-xs">{t("libraries.newHint")}</span>
        </button>
      </div>
    </div>
  );
}
