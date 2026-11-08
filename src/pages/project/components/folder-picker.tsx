import { useState } from "react";
import { ChevronDown, ChevronRight, Files } from "lucide-react";

import { ListRow } from "@shared/ui/kit";
import { FolderGlyph } from "../files/folder-glyph";
import { isInside } from "../project-rel";
import { useProjectContext } from "../project-context";
import { useFolderScan } from "../use-folder-scan";
import type { FolderPickerNodeProps, FolderPickerProps } from "./folder-picker.types";
import { t } from "../project.i18n";

/** The project's folders as a tree to pick one from (the root first). */
export function FolderPicker(props: FolderPickerProps) {
  return (
    <div className="max-h-72 overflow-y-auto rounded-md border p-1">
      <PickerNode {...props} rel="" name={t("tree.all")} depth={0} />
    </div>
  );
}

function PickerNode({ rel, name, depth, value, onChange, exclude }: FolderPickerNodeProps) {
  const { record, manifest } = useProjectContext();
  const [open, setOpen] = useState(rel === "");
  const { entries } = useFolderScan(record.root, rel, 0, open);
  const children = entries.filter((e) => e.kind === "folder");
  const blocked = exclude !== undefined && isInside(exclude, rel);
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <div>
      <ListRow
        size="md"
        depth={depth}
        muted={blocked}
        selected={value === rel}
        onSelect={blocked ? undefined : () => onChange(rel)}
        icon={
          <>
            {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the picker's expand toggle */}
            <button
              type="button"
              aria-label={t(open ? "tree.collapse" : "tree.expand", { name })}
              onClick={(event) => {
                event.stopPropagation();
                setOpen(!open);
              }}
              className="mr-1 flex size-4 cursor-pointer items-center justify-center"
            >
              <Chevron />
            </button>
            {rel === "" ? <Files /> : <FolderGlyph color={manifest.folders[rel]?.color} />}
          </>
        }
        label={name}
      />
      {open &&
        children.map((child) => (
          <PickerNode
            key={child.rel}
            rel={child.rel}
            name={child.name}
            depth={depth + 1}
            value={value}
            onChange={onChange}
            exclude={exclude}
          />
        ))}
    </div>
  );
}
