/** What the Data tab shows: the list, a new source's form or a source's detail. */
export type DataTabView =
  { kind: "list" } | { kind: "create"; type: string } | { kind: "detail"; id: string };
