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

/** The section tools are listed in when their `library` placement names none. */
export const LIBRARY_TOOLS_SECTION = "tools";

export const LIBRARY_TABS: readonly LibraryTabInfo[] = [
  { id: "all", label: "All" },
  { id: "templates", label: "Templates" },
  { id: "lists", label: "Lists" },
  { id: "widgets", label: "Widgets" },
];

/** The built-in sections, in the order they're listed. */
export const BUILT_IN_SECTIONS: readonly LibrarySection[] = [
  {
    id: LIBRARY_TOOLS_SECTION,
    title: "Board tools",
    description: "Stickers, tables and diagrams, one click away.",
    order: 10,
  },
  {
    id: "templates",
    title: "Templates",
    description: "Start a session from a ready-made layout.",
    tab: "templates",
    order: 20,
  },
  {
    id: "lists",
    title: "Lists & checklists",
    description: "Keep track of tasks, steps and ideas.",
    tab: "lists",
    order: 30,
  },
  {
    id: "widgets",
    title: "Widgets",
    description: "Interactive pieces for running a session together.",
    tab: "widgets",
    order: 40,
  },
];

/** What's coming next (the board's tools are listed from their tool entries, `toolLibraryItems`). */
export const BUILT_IN_ITEMS: readonly LibraryItem[] = [
  soon("templates", "brainstorm", "Brainstorm", Lightbulb, "Collect and vote on ideas.", 10),
  soon("templates", "retro", "Retrospective", RotateCcw, "What went well, what to change.", 20),
  soon("templates", "kanban", "Kanban", Columns3, "To do, doing, done.", 30),
  soon("lists", "checklist", "Checklist", CheckSquare, "Tasks you tick off.", 10),
  soon("lists", "bullets", "Bulleted list", List, "Points in no particular order.", 20),
  soon("lists", "numbered", "Numbered list", ListOrdered, "Steps in order.", 30),
  soon("widgets", "timer", "Timer", Timer, "A countdown everyone sees.", 10),
  soon("widgets", "voting", "Voting", Vote, "Let everyone pick their favorites.", 20),
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
