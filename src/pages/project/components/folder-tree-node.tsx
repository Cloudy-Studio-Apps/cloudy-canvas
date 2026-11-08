import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { cn, ListRow } from "@shared/ui/kit";
import { FileContextMenu } from "@pages/home/components/file-context-menu";
import { entryActions } from "../files/entry-actions";
import { FolderGlyph } from "../files/folder-glyph";
import { InlineName } from "../files/inline-name";
import { dragId, useProjectContext } from "../project-context";
import { useFolderScan } from "../use-folder-scan";
import { FolderColorButton } from "./folder-color-button";
import type { FolderTreeNodeProps } from "./folder-tree-node.types";
import { t } from "../project.i18n";

/** A folder in the sidebar tree: its children are read when it opens, its count is always read. */
export function FolderTreeNode({ rel, name }: FolderTreeNodeProps) {
  const ctx = useProjectContext();
  const [open, setOpen] = useState(false);
  const { entries } = useFolderScan(ctx.record.root, rel, ctx.scanRev);
  const folders = entries.filter((e) => e.kind === "folder");
  const count = entries.filter((e) => e.kind === "board" || e.kind === "design").length;
  const entry = { name, rel, kind: "folder" as const, updatedAt: null };
  const over = ctx.drag.drag?.overId === dragId("folder", rel);
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <div>
      <FileContextMenu actions={entryActions(entry, ctx)}>
        <ListRow
          selected={ctx.folder === rel}
          onSelect={() => ctx.setFolder(rel)}
          {...ctx.drag.grabProps(dragId("folder", rel), ctx.renaming !== rel)}
          {...ctx.drag.dropProps(dragId("folder", rel))}
          className={cn(over && "bg-primary-soft ring-1 ring-primary")}
          icon={
            <>
              {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the tree's expand toggle */}
              <button
                type="button"
                aria-label={t(open ? "tree.collapse" : "tree.expand", { name })}
                aria-expanded={open}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(!open);
                }}
                className={cn(
                  "mr-0.5 flex size-4 cursor-pointer items-center justify-center rounded-sm hover:bg-hover",
                  folders.length === 0 && "invisible",
                )}
              >
                <Chevron />
              </button>
              <FolderGlyph color={ctx.manifest.folders[rel]?.color} />
            </>
          }
          label={<InlineName entry={entry} label={name} fixed />}
          meta={count > 0 ? count : undefined}
          actions={<FolderColorButton rel={rel} name={name} />}
        />
      </FileContextMenu>
      {open && folders.length > 0 && (
        <div className="ml-[15px] border-l">
          {folders.map((child) => (
            <FolderTreeNode key={child.rel} rel={child.rel} name={child.name} />
          ))}
        </div>
      )}
    </div>
  );
}
