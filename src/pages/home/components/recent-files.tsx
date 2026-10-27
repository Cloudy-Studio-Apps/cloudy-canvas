import { useMemo, useState } from "react";

import { useHomeStore } from "@shared/stores/home-store";
import { DEFAULT_RECENT_FILES_FILTER, filterRecentFiles } from "../filter-recent-files";
import { FileCard } from "./file-card";
import { RecentFilesList } from "./recent-files-list";
import { RecentFilesToolbar } from "./recent-files-toolbar";
import type { RecentFilesProps } from "./recent-files.types";
import { t } from "../home.i18n";

export function RecentFiles({ files, missing, kindOf, onOpen }: RecentFilesProps) {
  const [filter, setFilter] = useState(DEFAULT_RECENT_FILES_FILTER);
  const view = useHomeStore((s) => s.recentView);
  const shown = useMemo(() => filterRecentFiles(files, filter, kindOf), [files, filter, kindOf]);

  return (
    <section aria-labelledby="recent-files-heading" className="space-y-4">
      <h2 id="recent-files-heading" className="text-lg font-semibold tracking-tight">
        {t("recent.title")}
      </h2>
      <RecentFilesToolbar filter={filter} onChange={setFilter} />
      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t("recent.noMatch")}</p>
      ) : view === "list" ? (
        <RecentFilesList files={shown} missing={missing} kindOf={kindOf} onOpen={onOpen} />
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
          {shown.map((file) => (
            <li key={file.id} className="grid">
              <FileCard
                file={file}
                kind={kindOf(file)}
                missing={missing.has(file.id)}
                onOpen={onOpen}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
