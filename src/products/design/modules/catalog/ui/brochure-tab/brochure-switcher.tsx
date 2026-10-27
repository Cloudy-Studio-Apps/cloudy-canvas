import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { tCommon } from "@shared/core";

import { LayerName } from "../../../layers/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { t } from "../../catalog.i18n";

/**
 * The open brochure's name atop the Brochure tab, and its menu: the design page's brochures to
 * open one, a new brochure, and renaming (also by double-click), duplicating or deleting this one.
 */
export function BrochureSwitcher() {
  const { brochures, list, brochure, scope } = useBrochure();
  const [renaming, setRenaming] = useState(false);
  if (!brochure || scope === null) return null;

  if (renaming) {
    return (
      <div className="flex h-10 shrink-0 items-center border-b px-2 text-sm font-semibold">
        <LayerName
          name={brochure.name}
          editing
          onRename={(name) => brochures.rename(brochure.id, name)}
          onDone={() => setRenaming(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-10 shrink-0 items-center border-b px-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the brochure's name as the menu's trigger */}
          <button
            type="button"
            title={t("tab.switcher.title")}
            onDoubleClick={() => setRenaming(true)}
            className="flex min-w-0 cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-sm font-semibold text-foreground hover:bg-hover data-[state=open]:bg-hover [&_svg]:size-3.5 [&_svg]:shrink-0"
          >
            <span className="truncate">{brochure.name}</span>
            <ChevronDown />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            {t("tab.switcher.title")}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup value={brochure.id} onValueChange={(id) => brochures.open(id)}>
            {list.map((item) => (
              <DropdownMenuRadioItem key={item.id} value={item.id}>
                <span className="truncate">{item.name}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => brochures.create(scope)}>
            {t("tab.switcher.new")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setRenaming(true)}>
            {tCommon("rename")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => brochures.duplicate(brochure.id)}>
            {tCommon("duplicate")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => brochures.remove(brochure.id)}
            className="text-destructive"
          >
            {tCommon("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
