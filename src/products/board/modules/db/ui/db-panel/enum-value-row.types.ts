import type { DbEnumElement, DbEnumValue } from "@board";

export interface EnumValueRowProps {
  target: DbEnumElement;
  value: DbEnumValue;
  index: number;
}
