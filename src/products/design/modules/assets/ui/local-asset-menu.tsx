import { FolderInput, Pencil, Trash2 } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@shared/ui/kit";
import type { LocalAssetMenuProps } from "./assets-ui.types";
import { t } from "../assets.i18n";

/** The right-click menu of one of the file's own pictures: rename, move to a library, delete. */
export function LocalAssetMenu({ asset, local, children }: LocalAssetMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem className="gap-2 text-xs" onSelect={() => local.rename(asset)}>
          <Pencil className="size-3.5" />
          {t("menu.rename")}
        </ContextMenuItem>
        {local.targets.map((target) => (
          <ContextMenuItem
            key={target.id}
            className="gap-2 text-xs"
            onSelect={() => local.moveTo(asset, target.id)}
          >
            <FolderInput className="size-3.5" />
            {t("menu.moveTo", { library: target.name })}
          </ContextMenuItem>
        ))}
        <ContextMenuSeparator />
        <DeleteItem {...{ asset, local }} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

/** Its own component so the check of which layers show the picture runs only when the menu opens. */
function DeleteItem({ asset, local }: Omit<LocalAssetMenuProps, "children">) {
  const used = local.isUsed(asset.id);
  return (
    <ContextMenuItem
      className="gap-2 text-xs text-destructive"
      disabled={used}
      onSelect={() => local.remove(asset)}
    >
      <Trash2 className="size-3.5" />
      {used ? t("menu.inUse") : t("menu.delete")}
    </ContextMenuItem>
  );
}
