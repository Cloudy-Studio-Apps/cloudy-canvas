import { FileCode, Folder } from "lucide-react";

import { ListRow } from "@shared/ui/kit";
import { fileTree } from "./file-tree";
import type { CodeFileListProps } from "./code-file-list.types";
import { t } from "../db-export.i18n";

/** The generated files as a tree of folders; a click shows a file. */
export function CodeFileList({ files, selected, onSelect }: CodeFileListProps) {
  const rows = fileTree(files.map((file) => file.path));
  return (
    <div role="tree" aria-label={t("dialog.files")} className="flex flex-col">
      {rows.map((row) =>
        row.kind === "folder" ? (
          <ListRow
            key={`folder:${row.path}`}
            size="sm"
            depth={row.depth}
            muted
            icon={<Folder className="size-3.5" />}
            label={row.name}
          />
        ) : (
          <ListRow
            key={row.path}
            size="sm"
            depth={row.depth}
            icon={<FileCode className="size-3.5" />}
            label={row.name}
            selected={row.path === selected}
            onSelect={() => onSelect(row.path)}
          />
        ),
      )}
    </div>
  );
}
