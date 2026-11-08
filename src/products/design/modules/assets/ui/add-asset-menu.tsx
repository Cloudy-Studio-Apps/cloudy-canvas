import { FolderPlus, Upload } from "lucide-react";
import { useState } from "react";

import { PanelAddButton } from "@design/ui/components/panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import { GroupDialog } from "./group-dialog";
import type { AddAssetMenuProps } from "./assets-ui.types";
import { t } from "../assets.i18n";

/**
 * The tab's "+": upload pictures to a library of the project (choosing which) or to this file
 * only, and name a group (a path like `Brand/Logo`) for the next uploads.
 */
export function AddAssetMenu({ sources, group, onGroup, onUpload }: AddAssetMenuProps) {
  const [naming, setNaming] = useState(false);
  const libraries = sources.filter((source) => source.libraryId !== null && source.editable);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span>
            <PanelAddButton label={t("add.title")} />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            {group ? t("add.intoGroup", { group }) : t("add.upload")}
          </DropdownMenuLabel>
          {libraries.map((source) => (
            <DropdownMenuItem
              key={source.key}
              className="gap-2 text-xs"
              onSelect={() => onUpload(source.libraryId)}
            >
              <Upload className="size-3.5" />
              {t("add.toLibrary", { library: source.name })}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem className="gap-2 text-xs" onSelect={() => onUpload(null)}>
            <Upload className="size-3.5" />
            {t("add.toFile")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-xs" onSelect={() => setNaming(true)}>
            <FolderPlus className="size-3.5" />
            {t("add.group")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <GroupDialog open={naming} group={group} onClose={() => setNaming(false)} onApply={onGroup} />
    </>
  );
}
