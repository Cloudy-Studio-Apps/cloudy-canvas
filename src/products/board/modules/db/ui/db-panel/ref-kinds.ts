import type { DbRefKind } from "../../table/db-table.types";

/** Relation kinds in the order the picker shows them, read from the owning column's side. */
export const REF_KINDS: { kind: DbRefKind; label: string; description: string }[] = [
  { kind: ">", label: "N : 1", description: "Many to one" },
  { kind: "<", label: "1 : N", description: "One to many" },
  { kind: "-", label: "1 : 1", description: "One to one" },
  { kind: "<>", label: "N : N", description: "Many to many" },
];
