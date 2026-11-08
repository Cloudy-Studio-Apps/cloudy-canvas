import { useMemo, useState } from "react";

import type { ColorChangeInfo, ColorValue } from "@canvas-ui";
import { Button } from "@shared/ui/kit";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import type { DesignNode } from "../../core";
import { collectSelectionColors } from "../collect-selection-colors";
import { recolorPatches } from "../recolor-patches";
import type { SelectionColor } from "../selection-colors.types";
import { SelectionColorRow } from "./selection-color-row";
import { t } from "../selection-colors.i18n";

/** How many colors show before "See all". */
const FIRST_COLORS = 8;

/**
 * Every color the selection and what it holds paint with (fills, strokes, vectors' areas, texts'
 * ranges, gradients' stops), each changed everywhere it's used at once, as in Figma. Colors bound
 * to a variable or a style are left out: they change there.
 */
export function SelectionColorsSection({ selection: { nodes, elements } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const colors = useMemo(() => collectSelectionColors(nodes, elements), [nodes, elements]);
  const [all, setAll] = useState(false);
  /**
   * The list as it was when a drag started: while it goes on, the dragged color would otherwise
   * become a new entry (or join another) and its row, with the open picker, would go.
   */
  const [held, setHeld] = useState<{ selection: string; colors: SelectionColor[] } | null>(null);
  const selection = nodes.map((node) => node.id).join(",");

  // Held only for the selection it was taken for.
  const shown = held?.selection === selection ? held.colors : colors;
  const visible = all ? shown : shown.slice(0, FIRST_COLORS);

  const change = (entry: SelectionColor, next: ColorValue, info: ColorChangeInfo) => {
    const nodeOf = (id: string) => engine.getElement(id) as DesignNode | undefined;
    const patches = recolorPatches(entry.refs, next.color, next.opacity, nodeOf);
    if (patches.size > 0) {
      engine.doc.checkpoint();
      engine.doc.updateMany(patches);
    }
    setHeld(
      info.done
        ? null
        : {
            selection,
            colors: shown.map((c) =>
              c.key === entry.key
                ? { ...c, color: next.color.toLowerCase(), opacity: next.opacity }
                : c,
            ),
          },
    );
  };

  const selectUses = (entry: SelectionColor) =>
    engine.select([...new Set(entry.refs.map((ref) => ref.nodeId))]);

  return (
    <PanelSection title={t("section.title")}>
      <div className="flex flex-col gap-1.5">
        {visible.map((entry) => (
          <SelectionColorRow
            key={entry.key}
            entry={entry}
            onChange={(next, info) => change(entry, next, info)}
            onSelect={() => selectUses(entry)}
          />
        ))}
        {shown.length > FIRST_COLORS && (
          <Button
            variant="ghost"
            size="xs"
            className="self-start"
            onClick={() => setAll((open) => !open)}
          >
            {all ? t("section.seeFewer") : t("section.seeAll", { count: shown.length })}
          </Button>
        )}
      </div>
    </PanelSection>
  );
}
