import type { DbEnumElement, DbEnumValue } from "../../enum/db-enum.types";

export interface EnumValueRowProps {
  target: DbEnumElement;
  value: DbEnumValue;
  index: number;
}
