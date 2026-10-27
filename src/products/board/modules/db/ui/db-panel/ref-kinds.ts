import type { DbRefKind } from "../../table/db-table.types";
import { t } from "../../db.i18n";

/** Relation kinds in the order the picker shows them, read from the owning column's side. */
export const REF_KINDS: { kind: DbRefKind; label: string; description: string }[] = [
  { kind: ">", label: "N : 1", description: t("ref.manyToOne") },
  { kind: "<", label: "1 : N", description: t("ref.oneToMany") },
  { kind: "-", label: "1 : 1", description: t("ref.oneToOne") },
  { kind: "<>", label: "N : N", description: t("ref.manyToMany") },
];
