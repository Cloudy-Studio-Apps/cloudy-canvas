import { fileNameFromPath, relativeTime, type FileInfo } from "@shared/core";
import { FilePreview, KIND_LABEL, useFileKindOf } from "@pages/shared/files";
import { folderOfFile } from "@pages/shared/files";
import { useProjectContext } from "../project-context";
import { t } from "../project.i18n";

/** The project's newest files, wherever they are in its folders. */
export function RecentlyEdited() {
  const { recent, record, actions, manifest } = useProjectContext();
  const kindOf = useFileKindOf();
  if (recent.length === 0) return null;

  const where = (file: FileInfo) => {
    const folder = folderOfFile(record.root, file.path);
    return folder ? folder.split("/").join(" / ") : manifest.name;
  };

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">{t("files.recent")}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
        {recent.map((file) => (
          // eslint-disable-next-line no-restricted-syntax -- bespoke: a recent file's card with its preview
          <button
            key={file.id}
            type="button"
            onClick={() =>
              void actions.open({
                name: file.path.split(/[\\/]/).pop() ?? file.name,
                rel: relRel(record.root, file.path),
                kind: file.type,
                updatedAt: file.updatedAt,
              })
            }
            className="flex cursor-pointer items-center gap-3 rounded-card border bg-surface p-2 text-left shadow-soft transition-[box-shadow,border-color] hover:border-border-strong hover:shadow-lifted focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <FilePreview
              file={file}
              kind={kindOf(file)}
              missing={false}
              iconSize={null}
              className="h-12 w-16 shrink-0 rounded-md"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {fileNameFromPath(file.path)}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {where(file)} · {relativeTime(file.updatedAt) ?? t("justNow")}
              </span>
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase">
              {KIND_LABEL[kindOf(file)]}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function relRel(root: string, path: string): string {
  const folder = folderOfFile(root, path);
  const name = path.split(/[\\/]/).pop() ?? path;
  return folder ? `${folder}/${name}` : name;
}
