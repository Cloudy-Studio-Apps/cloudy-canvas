import type { DbEnumShape, DbEnumValue } from "@engine";

export interface EnumValueRowProps {
  target: DbEnumShape;
  value: DbEnumValue;
  index: number;
}
