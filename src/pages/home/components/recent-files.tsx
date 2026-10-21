import { useMemo, useState } from "react";

import { DEFAULT_RECENT_FILES_FILTER, filterRecentFiles } from "../filter-recent-files";
import { EmptyState } from "./empty-state";
import { FileCard } from "./file-card";
import { RecentFilesToolbar } from "./recent-files-toolbar";
import type { RecentFilesProps } from "./recent-files.types";

export function RecentFiles({ files, missing, onOpen }: RecentFilesProps) {
  const [filter, setFilter] = useState(DEFAULT_RECENT_FILES_FILTER);
  const shown = useMemo(() => filterRecentFiles(files, filter), [files, filter]);

  return (
    <section aria-labelledby="recent-files-heading" className="space-y-4">
      <h2
        id="recent-files-heading"
        className="text-sm font-medium tracking-wide text-muted-foreground"
      >
        Recent files
      </h2>
      {files.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <RecentFilesToolbar filter={filter} onChange={setFilter} />
          {shown.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No files match.</p>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
              {shown.map((file) => (
                <li key={file.id} className="grid">
                  <FileCard file={file} missing={missing.has(file.id)} onOpen={onOpen} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
