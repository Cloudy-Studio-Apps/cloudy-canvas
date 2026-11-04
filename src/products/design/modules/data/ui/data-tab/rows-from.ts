import type { DataExtraValue, DataList } from "../../table";
import { t } from "../../data.i18n";

/** The select's value for "the first list found" (a path can't be this). */
export const AUTO_ROWS = "\u0000auto";

/**
 * The choices of where the rows are: the first list found, then each list the data had, with
 * how many items; a path set before that the data no longer has stays, so it can be seen.
 */
export function rowsFromOptions(
  lists: readonly DataList[],
  current: string | null,
): { value: string; label: string }[] {
  const first = lists[0];
  const options = [
    {
      value: AUTO_ROWS,
      label: first ? t("rowsFrom.autoWith", { list: listName(first.path) }) : t("rowsFrom.auto"),
    },
    ...lists.map((list) => ({
      value: list.path,
      label: t("rowsFrom.list", { list: listName(list.path), count: list.count }),
    })),
  ];
  if (current !== null && !lists.some((l) => l.path === current)) {
    options.push({ value: current, label: t("rowsFrom.missing", { list: listName(current) }) });
  }
  return options;
}

/** A list's path as shown: the data itself has none. */
export function listName(path: string): string {
  return path === "" ? t("rowsFrom.whole") : path;
}

/** The plain values beside the rows, as one line (`total 194 · skip 0`), or "". */
export function extrasText(extras: Record<string, DataExtraValue> | undefined): string {
  const entries = Object.entries(extras ?? {});
  if (entries.length === 0) return "";
  const list = entries
    .slice(0, 4)
    .map(([key, value]) => `${key} ${value === null ? "—" : String(value)}`)
    .join(" · ");
  return t("rowsFrom.extras", { list });
}
