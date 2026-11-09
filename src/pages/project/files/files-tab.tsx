import { useState } from "react";

import { EmptyState } from "@shared/ui/kit";
import { FolderOpen } from "lucide-react";
import { useProjectContext } from "../project-context";
import { parentRel } from "../project-rel";
import { useFolderScan } from "../use-folder-scan";
import { FilesToolbar } from "./files-toolbar";
import type { FilesSort, FilesView } from "./files-toolbar.types";
import { FolderTile } from "./folder-tile";
import { NewFolderTile } from "./new-folder-tile";
import { PathBar } from "./path-bar";
import { ProjectFileCard } from "./project-file-card";
import { RecentlyEdited } from "./recently-edited";
import { sortEntries } from "./sort-entries";
import { useFolderSearch } from "./use-folder-search";
import { t } from "../project.i18n";

/** The Files tab: recently edited, the path, search and sort, then the folder's folders and files. */
export function FilesTab() {
  const { record, folder, scanRev, manifest } = useProjectContext();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<FilesSort>("edited");
  const [view, setView] = useState<FilesView>("grid");
  const scan = useFolderScan(record.root, folder, scanRev);
  const found = useFolderSearch(record.root, folder, query, scanRev);
  const shown = sortEntries(found ?? scan.entries, sort);
  const folders = shown.filter((e) => e.kind === "folder");
  const files = shown.filter((e) => e.kind !== "folder");
  const searching = found !== null;
  const whereOf = (rel: string) => {
    const parent = parentRel(rel);
    return searching && parent !== folder ? parent.split("/").join(" / ") : undefined;
  };

  return (
    <div className="space-y-6 p-6">
      {!searching && folder === "" && <RecentlyEdited />}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1">
            <PathBar />
          </div>
          <FilesToolbar
            query={query}
            onQuery={setQuery}
            sort={sort}
            onSort={setSort}
            view={view}
            onView={setView}
          />
        </div>
        {folders.length > 0 || !searching ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
            {folders.map((entry) => (
              <FolderTile key={entry.rel} entry={entry} />
            ))}
            {!searching && <NewFolderTile />}
          </div>
        ) : null}
        {files.length > 0 ? (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3"
                : "flex flex-col gap-2"
            }
          >
            {files.map((entry) => (
              <ProjectFileCard
                key={entry.rel}
                entry={entry}
                view={view}
                where={whereOf(entry.rel)}
              />
            ))}
          </div>
        ) : searching ? (
          folders.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t("files.noMatches", { query: query.trim() })}
            </p>
          )
        ) : (
          !scan.loading &&
          folders.length === 0 && (
            <EmptyState
              icon={<FolderOpen />}
              title={t("files.emptyTitle", { name: folder === "" ? manifest.name : folder })}
              description={t("files.emptyDescription")}
              className="py-10"
            />
          )
        )}
      </section>
    </div>
  );
}
