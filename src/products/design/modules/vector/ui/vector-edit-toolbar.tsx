import { MousePointer2, PaintBucket, PenTool, Scissors, Spline } from "lucide-react";

import { ModeToolbar, type ModeToolbarEntry } from "@canvas-ui";
import { VECTOR_TOOLS } from "../edit/vector-tools";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { t } from "../vector.i18n";

const TOOLS: readonly ModeToolbarEntry[] = [
  {
    tool: VECTOR_TOOLS.move,
    label: t("edit.move.label"),
    description: t("edit.move.description"),
    icon: MousePointer2,
  },
  {
    tool: VECTOR_TOOLS.pen,
    label: t("edit.pen.label"),
    description: t("edit.pen.description"),
    icon: PenTool,
  },
  {
    tool: VECTOR_TOOLS.bend,
    label: t("edit.bend.label"),
    description: t("edit.bend.description"),
    icon: Spline,
  },
  {
    tool: VECTOR_TOOLS.bucket,
    label: t("edit.bucket.label"),
    description: t("edit.bucket.description"),
    icon: PaintBucket,
  },
  {
    tool: VECTOR_TOOLS.cut,
    label: t("edit.cut.label"),
    description: t("edit.cut.description"),
    icon: Scissors,
  },
];

/** The toolbar of the vector edit mode (shown instead of the main one), with Done. */
export function VectorEditToolbar() {
  const engine = useDesignEngine();
  return (
    <ModeToolbar
      label={t("edit.title")}
      items={TOOLS}
      onDone={() => engine.commands.editSelection?.()}
    />
  );
}
