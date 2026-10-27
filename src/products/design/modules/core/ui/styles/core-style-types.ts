import { Palette, PenLine } from "lucide-react";

import {
  PAINT_STYLE,
  paintBindingsOf,
  paintStyleOfNode,
  paintStyleSummary,
  STROKE_STYLE,
  strokeBindingsOf,
  strokeStyleOfNode,
  strokeStyleSummary,
} from "../../styles";
import type { StyleTypeEntry } from "../core.points.types";
import { createNodeStyle } from "./create-node-style";
import { PaintStyleEditor } from "./paint-style-editor";
import { PaintStylePreview } from "./paint-style-preview";
import { StrokeStyleEditor } from "./stroke-style-editor";
import { StrokeStylePreview } from "./stroke-style-preview";
import { t } from "../../core.i18n";

/** Color and stroke styles (text styles are the text module's, effect styles the effects'). */
export const CORE_STYLE_TYPES: readonly StyleTypeEntry[] = [
  {
    id: PAINT_STYLE,
    label: t("styles.color"),
    heading: t("styles.colorHeading"),
    icon: Palette,
    order: 20,
    create: (engine) =>
      createNodeStyle(
        engine,
        PAINT_STYLE,
        (node) => paintStyleOfNode(node, "fills"),
        (node) => paintBindingsOf(node, "fills"),
      ),
    Preview: PaintStylePreview,
    summary: paintStyleSummary,
    Editor: PaintStyleEditor,
  },
  {
    id: STROKE_STYLE,
    label: t("styles.stroke"),
    heading: t("styles.strokeHeading"),
    icon: PenLine,
    order: 40,
    create: (engine) => createNodeStyle(engine, STROKE_STYLE, strokeStyleOfNode, strokeBindingsOf),
    Preview: StrokeStylePreview,
    summary: strokeStyleSummary,
    Editor: StrokeStyleEditor,
  },
];
