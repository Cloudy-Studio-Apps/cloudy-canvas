import { tCommon } from "@shared/core";
import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
} from "@shared/ui/kit";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { deletePage, duplicatePage } from "./page-actions";
import { usePageSplit } from "./split/use-page-split";
import type { PageMenuProps } from "./page-row.types";
import { t } from "../pages.i18n";

/** A page's ⋯ menu (also its right-click menu): rename, duplicate, split into a new file, delete. */
export function PageMenu({
  page,
  deletable,
  splittable,
  open,
  onOpenChange,
  onRename,
}: PageMenuProps) {
  const engine = useDesignEngine();
  const split = usePageSplit();
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <IconButton
          size="xs"
          className="size-5 rounded-xs"
          label={t("list.options", { name: page.name })}
          title={t("list.optionsTitle")}
          tooltip={false}
          revealOnHover
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-40"
        // React events bubble out of the portal: the row mustn't take them as its own clicks.
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuItem onSelect={onRename}>{tCommon("rename")}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => duplicatePage(engine, page.id)}>
          {tCommon("duplicate")}
        </DropdownMenuItem>
        {splittable && (
          <DropdownMenuItem onSelect={() => split(page.id)}>{t("list.split")}</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!deletable}
          onSelect={() => deletePage(engine, page.id)}
          className="text-destructive"
        >
          {tCommon("delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
