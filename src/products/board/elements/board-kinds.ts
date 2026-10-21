import { ElementKinds } from "@canvas";

import type { BoardToolOptions } from "../board-options.types";
import { DbEnumKind, DbTableKind } from "./db";
import {
  ErAggregateKind,
  ErAttributeKind,
  ErConstraintKind,
  ErEntityKind,
  ErIsaKind,
  ErRelationKind,
} from "./er";
import { GeoKind } from "./geo";
import { SectionKind } from "./section";
import { StickyKind } from "./sticky";
import { StrokeKind } from "./stroke";

/**
 * Every element type a board can hold. The built-ins are registered here; plugins call
 * `boardKinds.register(new MyKind())` before a board opens.
 */
export const boardKinds = new ElementKinds<BoardToolOptions>();
boardKinds.register(new StickyKind());
boardKinds.register(new StrokeKind());
boardKinds.register(new GeoKind());
boardKinds.register(new SectionKind());
boardKinds.register(new DbTableKind());
boardKinds.register(new DbEnumKind());
boardKinds.register(new ErEntityKind());
boardKinds.register(new ErRelationKind());
boardKinds.register(new ErAttributeKind());
boardKinds.register(new ErIsaKind());
boardKinds.register(new ErAggregateKind());
boardKinds.register(new ErConstraintKind());
