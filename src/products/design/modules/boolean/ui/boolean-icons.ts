import {
  SquaresExclude,
  SquaresIntersect,
  SquaresSubtract,
  SquaresUnite,
  type LucideIcon,
} from "lucide-react";

import type { BooleanOperation } from "@design";

/** Each operation's icon (toolbar, menus, the Boolean section, the layers panel). */
export const BOOLEAN_ICONS: Readonly<Record<BooleanOperation, LucideIcon>> = {
  union: SquaresUnite,
  subtract: SquaresSubtract,
  intersect: SquaresIntersect,
  exclude: SquaresExclude,
};

/** Each operation's command id. */
export const BOOLEAN_COMMANDS: Readonly<Record<BooleanOperation, string>> = {
  union: "booleanUnion",
  subtract: "booleanSubtract",
  intersect: "booleanIntersect",
  exclude: "booleanExclude",
};
