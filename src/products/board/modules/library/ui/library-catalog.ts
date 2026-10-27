import {
  CheckSquare,
  Columns3,
  Lightbulb,
  List,
  ListOrdered,
  RotateCcw,
  Timer,
  Vote,
  type LucideIcon,
} from "lucide-react";

import type { LibraryItem, LibrarySection, LibraryTabInfo } from "./library.types";
import { t } from "../library.i18n";

/** The section tools are listed in when their `library` placement names none. */
export const LIBRARY_TOOLS_SECTION = "tools";

export const LIBRARY_TABS: readonly LibraryTabInfo[] = [
  { id: "all", label: t("tabs.all") },
  { id: "templates", label: t("tabs.templates") },
  { id: "lists", label: t("tabs.lists") },
  { id: "widgets", label: t("tabs.widgets") },
];

/** The built-in sections, in the order they're listed. */
export const BUILT_IN_SECTIONS: readonly LibrarySection[] = [
  {
    id: LIBRARY_TOOLS_SECTION,
    title: t("sections.tools.title"),
    description: t("sections.tools.description"),
    order: 10,
  },
  {
    id: "templates",
    title: t("sections.templates.title"),
    description: t("sections.templates.description"),
    tab: "templates",
    order: 20,
  },
  {
    id: "lists",
    title: t("sections.lists.title"),
    description: t("sections.lists.description"),
    tab: "lists",
    order: 30,
  },
  {
    id: "widgets",
    title: t("sections.widgets.title"),
    description: t("sections.widgets.description"),
    tab: "widgets",
    order: 40,
  },
];

/** What's coming next (the board's tools are listed from their tool entries, `toolLibraryItems`). */
export const BUILT_IN_ITEMS: readonly LibraryItem[] = [
  soon(
    "templates",
    "brainstorm",
    t("items.brainstorm.label"),
    Lightbulb,
    t("items.brainstorm.description"),
    10,
  ),
  soon("templates", "retro", t("items.retro.label"), RotateCcw, t("items.retro.description"), 20),
  soon("templates", "kanban", t("items.kanban.label"), Columns3, t("items.kanban.description"), 30),
  soon(
    "lists",
    "checklist",
    t("items.checklist.label"),
    CheckSquare,
    t("items.checklist.description"),
    10,
  ),
  soon("lists", "bullets", t("items.bullets.label"), List, t("items.bullets.description"), 20),
  soon(
    "lists",
    "numbered",
    t("items.numbered.label"),
    ListOrdered,
    t("items.numbered.description"),
    30,
  ),
  soon("widgets", "timer", t("items.timer.label"), Timer, t("items.timer.description"), 10),
  soon("widgets", "voting", t("items.voting.label"), Vote, t("items.voting.description"), 20),
];

function soon(
  section: string,
  id: string,
  label: string,
  icon: LucideIcon,
  description: string,
  order: number,
): LibraryItem {
  return { id: `${section}.${id}`, section, order, label, description, icon, comingSoon: true };
}
