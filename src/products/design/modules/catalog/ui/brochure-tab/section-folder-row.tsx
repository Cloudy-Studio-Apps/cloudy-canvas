import { useState } from "react";
import { Bookmark, ChevronDown, ChevronRight } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import { PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { cn } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { renameSection } from "../section-actions";
import { useCatalogViewStore } from "../stores/catalog-view-store";
import { dropId } from "./drop-position";
import { SectionFolderMenu } from "./section-folder-menu";
import type { SectionFolderRowProps } from "./brochure-page-row.types";
import { t } from "../../catalog.i18n";

/** How far each level of sections indents the rows in it, in px. */
export const INDENT_PX = 12;

/**
 * A section as a folder over its pages: the chevron folds it away, a click selects its pages, a
 * double-click on the name renames it, and it drags with all its pages (its subsections too). A
 * page dropped on it goes last in it; a right-click opens its menu (`SectionFolderMenu`).
 */
export function SectionFolderRow({ folder, rowDrag, carried }: SectionFolderRowProps) {
  const engine = useDesignEngine();
  const { brochure, pages } = useBrochure();
  const toggle = useCatalogViewStore((state) => state.toggleCollapsed);
  const [renaming, setRenaming] = useState(false);
  const { section } = folder.placed;
  const target = dropId({ kind: "section", id: section.id });
  const over = rowDrag.drag?.overId === target;
  const select = () => {
    const slots = new Set(folder.slots);
    engine.select(pages.filter((page) => slots.has(page.slot.id)).map((page) => page.frame.id));
  };

  return (
    <li>
      <SectionFolderMenu folder={folder} onRename={() => setRenaming(true)}>
        <div
          {...rowDrag.grabProps(target)}
          {...rowDrag.dropProps(target)}
          onClick={select}
          style={{ paddingLeft: folder.depth * INDENT_PX }}
          className={cn(
            "group flex h-7 cursor-default items-center gap-1 rounded-sm pr-1 text-xs hover:bg-hover",
            over && "bg-primary-soft hover:bg-primary-soft",
            carried && "opacity-50",
          )}
        >
          <span onClick={(event) => event.stopPropagation()}>
            <PanelIconButton
              label={folder.collapsed ? t("tab.folder.expand") : t("tab.folder.collapse")}
              onClick={() => toggle(section.id)}
            >
              {folder.collapsed ? <ChevronRight /> : <ChevronDown />}
            </PanelIconButton>
          </span>
          <Bookmark className="size-3 shrink-0 text-muted-foreground" />
          {renaming ? (
            <span className="min-w-0 flex-1" onClick={(event) => event.stopPropagation()}>
              <CommitInput
                autoFocus
                aria-label={t("section.name")}
                value={section.name}
                onCommit={(name) => {
                  if (brochure && name.trim()) renameSection(brochure, section.id, name.trim());
                }}
                onBlur={() => setRenaming(false)}
                className="h-6 text-xs"
              />
            </span>
          ) : (
            <span
              className="min-w-0 flex-1 truncate font-semibold text-foreground"
              onDoubleClick={() => setRenaming(true)}
            >
              {section.name}
            </span>
          )}
          <span className="shrink-0 text-muted-foreground tabular-nums">{folder.range}</span>
        </div>
      </SectionFolderMenu>
    </li>
  );
}
