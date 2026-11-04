import { BookmarkPlus, FilePlus } from "lucide-react";

import type { FrameElement } from "../../../frame";
import { paperSize } from "../../model/paper-size";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { addBlankPage, addSectionPage } from "../page-actions";
import type { AddPageEntry } from "./add-page-menu.types";
import { t } from "../../catalog.i18n";

/**
 * What the page list's add menus offer: a blank page the size of `base`, or one that starts a
 * new section, at `at` (default: the end; then they say so, else "after this one"). None
 * without a page to take the size from.
 */
export function useAddPageEntries(base: FrameElement | undefined, at?: number): AddPageEntry[] {
  const engine = useDesignEngine();
  if (!base) return [];
  const label = paperSize(base).name ?? "Page";
  const after = at !== undefined;
  return [
    {
      id: "blank",
      label: after ? t("tab.add.blankAfter") : t("tab.add.blank"),
      icon: FilePlus,
      run: () => addBlankPage(engine, base, label, at),
    },
    {
      id: "section",
      label: after ? t("tab.add.sectionAfter") : t("tab.add.section"),
      icon: BookmarkPlus,
      run: () => addSectionPage(engine, base, label, at),
    },
  ];
}
