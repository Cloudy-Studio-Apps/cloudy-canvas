import { EmptyState } from "./empty-state";
import { FileCard } from "./file-card";
import type { RecentFilesProps } from "./recent-files.types";

export function RecentFiles({ files, onOpen }: RecentFilesProps) {
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
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
          {files.map((file) => (
            <li key={file.id} className="grid">
              <FileCard file={file} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
