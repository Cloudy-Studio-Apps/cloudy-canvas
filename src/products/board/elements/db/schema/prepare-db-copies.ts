import type { CanvasElement, CopyContext } from "@canvas";

import { enumSize, isDbEnum } from "../enum";
import { isDbTable, tableSize, type DbTableElement } from "../table";
import { isDbmlNote } from "./schema-shapes";
import { freeName } from "./table-edits";

/**
 * Gives copied tables, enums and DBML notes names that aren't taken (`users` → `users_2`), since
 * the schema needs unique names. Copied columns typed with a renamed enum use its new name;
 * relations keep pointing at uncopied tables, but are cleared when their target isn't on this
 * board (pasted from another one).
 */
export function prepareDbCopies(
  copies: CanvasElement[],
  { existing }: CopyContext,
): CanvasElement[] {
  const taken = {
    tables: existing.filter(isDbTable).map((t) => ({ name: t.name })),
    enums: existing.filter(isDbEnum).map((e) => ({ name: e.name })),
    notes: existing.filter(isDbmlNote).map((n) => ({ name: n.noteName })),
  };
  const take = (list: { name: string }[], name: string) => {
    const free = freeName(list, name);
    list.push({ name: free });
    return free;
  };

  const enumNames = new Map<string, string>();
  const named: CanvasElement[] = copies.map((el) => {
    if (isDbEnum(el)) {
      const name = take(taken.enums, el.name);
      enumNames.set(el.name, name);
      return { ...el, name, ...enumSize(name, el.values) };
    }
    if (isDbmlNote(el)) return { ...el, noteName: take(taken.notes, el.noteName) };
    if (isDbTable(el)) return { ...el, name: take(taken.tables, el.name) };
    return el;
  });

  const columns = new Set(
    [...existing, ...named]
      .filter(isDbTable)
      .flatMap((t) => t.columns.map((c) => `${t.id}/${c.id}`)),
  );
  return named.map((el) => (isDbTable(el) ? retarget(el, enumNames, columns) : el));
}

/** A copied table with renamed enum types, dangling relations cleared, and its size. */
function retarget(
  table: DbTableElement,
  enumNames: ReadonlyMap<string, string>,
  columns: ReadonlySet<string>,
): DbTableElement {
  const next = table.columns.map((c) => ({
    ...c,
    type: enumNames.get(c.type) ?? c.type,
    ref: c.ref && columns.has(`${c.ref.tableId}/${c.ref.columnId}`) ? c.ref : null,
  }));
  return { ...table, columns: next, ...tableSize(table.name, next) };
}
