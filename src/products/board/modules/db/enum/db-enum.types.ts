import type { DbCardElement } from "../card";

export interface DbEnumValue {
  id: string;
  name: string;
  note: string;
}

/** A DBML enum, shown as a card; columns use it by naming it as their type. */
export interface DbEnumElement extends DbCardElement {
  type: "db-enum";
  values: DbEnumValue[];
}
