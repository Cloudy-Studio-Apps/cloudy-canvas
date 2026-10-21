import {
  CheckSquare,
  Columns3,
  Database,
  Lightbulb,
  List,
  ListOrdered,
  Network,
  RotateCcw,
  Sticker,
  Table,
  Timer,
  Vote,
  type LucideIcon,
} from "lucide-react";

import { boardKinds } from "@board";
import type { LibraryItem, LibrarySection, LibraryTabInfo } from "./library.types";

export const LIBRARY_TABS: readonly LibraryTabInfo[] = [
  { id: "all", label: "All" },
  { id: "templates", label: "Templates" },
  { id: "lists", label: "Lists" },
  { id: "widgets", label: "Widgets" },
];

/** The built-in sections, in the order they're listed. */
export const BUILT_IN_SECTIONS: readonly LibrarySection[] = [
  {
    id: "tools",
    title: "Board tools",
    description: "Stickers, tables and diagrams, one click away.",
  },
  {
    id: "templates",
    title: "Templates",
    description: "Start a session from a ready-made layout.",
    tab: "templates",
  },
  {
    id: "lists",
    title: "Lists & checklists",
    description: "Keep track of tasks, steps and ideas.",
    tab: "lists",
  },
  {
    id: "widgets",
    title: "Widgets",
    description: "Interactive pieces for running a session together.",
    tab: "widgets",
  },
];

/** The built-in items: the board's tools, and what's coming next. */
export const BUILT_IN_ITEMS: readonly LibraryItem[] = [
  toolItem("sticker", "sticker", Sticker),
  toolItem("table", "table", Table),
  toolItem("db", "db-table", Database, ["dbml", "schema", "sql"]),
  toolItem("er", "er-entity", Network, ["entity", "relation", "chen"]),
  soon("templates", "brainstorm", "Brainstorm", Lightbulb, "Collect and vote on ideas."),
  soon("templates", "retro", "Retrospective", RotateCcw, "What went well, what to change."),
  soon("templates", "kanban", "Kanban", Columns3, "To do, doing, done."),
  soon("lists", "checklist", "Checklist", CheckSquare, "Tasks you tick off."),
  soon("lists", "bullets", "Bulleted list", List, "Points in no particular order."),
  soon("lists", "numbered", "Numbered list", ListOrdered, "Steps in order."),
  soon("widgets", "timer", "Timer", Timer, "A countdown everyone sees."),
  soon("widgets", "voting", "Voting", Vote, "Let everyone pick their favorites."),
];

/** An item that switches to one of the board's tools, named by the element it creates. */
function toolItem(
  tool: string,
  element: string,
  icon: LucideIcon,
  keywords?: readonly string[],
): LibraryItem {
  const kind = boardKinds.get(element);
  return {
    id: `tool.${tool}`,
    section: "tools",
    label: kind?.label ?? element,
    description: kind?.description,
    icon,
    keywords,
    run: (engine) => engine.setTool(tool),
  };
}

function soon(
  section: string,
  id: string,
  label: string,
  icon: LucideIcon,
  description: string,
): LibraryItem {
  return { id: `${section}.${id}`, section, label, description, icon, comingSoon: true };
}
