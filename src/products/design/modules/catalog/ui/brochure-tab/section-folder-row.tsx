import { useState } from "react";
import { Bookmark, ChevronDown, ChevronRight } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import { PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { cn } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { CopyFolderMenu } from "./copy-folder-menu";
import { renameSection } from "../section-actions";
import { useCatalogViewStore } from "../stores/catalog-view-store";
import { dropId } from "./drop-position";
import { INDENT_PX } from "./page-list.constants";
import { RepeatBracket } from "./repeat-bracket";
import { RepeatMark } from "./repeat-mark";
import { SectionFolderMenu } from "./section-folder-menu";
import type { SectionFolderRowProps } from "./brochure-page-row.types";
import { t } from "../../catalog.i18n";

/**
 * A section as a folder over its pages: the chevron folds it away, a click selects its pages, a
 * double-click on the name renames it, and it drags with all its pages (its subsections too). A
 * page dropped on it goes last in it; a right-click opens its menu (`SectionFolderMenu`). A section
 * that repeats is badged; a copy a repeat made carries the data mark and is only folded, selected,
 * detached or deleted (`CopyFolderMenu`): never renamed, dragged, dropped on or given section
 * actions.
 */
export function SectionFolderRow({ folder, rowDrag, carried }: SectionFolderRowProps) {
  const engine = useDesignEngine();
  const { brochure, pages } = useBrochure();
  const toggle = useCatalogViewStore((state) => state.toggleCollapsed);
  const [renaming, setRenaming] = useState(false);
  const { section } = folder.placed;
  const { copy } = folder;
  const target = dropId({ kind: "section", id: section.id });
  const over = !copy && rowDrag.drag?.overId === target;
  const select = () => {
    const slots = new Set(folder.slots);
    engine.select(pages.filter((page) => slots.has(page.slot.id)).map((page) => page.frame.id));
  };

  const original = brochure?.record()?.sections.find((item) => item.id === folder.placed.from);
  const mark = copy ? (
    <RepeatMark kind="copy" label={t("repeat.copyOf", { name: original?.name ?? section.name })} />
  ) : section.repeat ? (
    <RepeatMark kind="template" label={t("repeat.badge", { source: section.repeat.source })} />
  ) : null;

  const row = (
    <div
      {...(copy ? {} : { ...rowDrag.grabProps(target), ...rowDrag.dropProps(target) })}
      onClick={select}
      style={{ paddingLeft: folder.depth * INDENT_PX }}
      className={cn(
        "group relative flex h-7 cursor-default items-center gap-1 rounded-sm pr-1 text-xs hover:bg-hover",
        over && "bg-primary-soft hover:bg-primary-soft",
        carried && "opacity-50",
      )}
    >
      <RepeatBracket depth={folder.bracket} />
      <span onClick={(event) => event.stopPropagation()}>
        <PanelIconButton
          label={folder.collapsed ? t("tab.folder.expand") : t("tab.folder.collapse")}
          onClick={() => toggle(section.id)}
        >
          {folder.collapsed ? <ChevronRight /> : <ChevronDown />}
        </PanelIconButton>
      </span>
      <Bookmark className="size-3 shrink-0 text-muted-foreground" />
      {renaming && !copy ? (
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
          onDoubleClick={copy ? undefined : () => setRenaming(true)}
        >
          {section.name}
        </span>
      )}
      {mark}
      <span className="shrink-0 text-muted-foreground tabular-nums">{folder.range}</span>
    </div>
  );

  return (
    <li>
      {copy ? (
        <CopyFolderMenu folder={folder}>{row}</CopyFolderMenu>
      ) : (
        <SectionFolderMenu folder={folder} onRename={() => setRenaming(true)}>
          {row}
        </SectionFolderMenu>
      )}
    </li>
  );
}
