import { useState } from "react";

import { canRestyleEdge, stickerEdgePatches } from "@design";
import { EffectColorField } from "../../effects/ui";
import { PanelIconButton } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError } from "@shared/stores/toast-store";
import { RotateCcw } from "lucide-react";
import type { StickerFieldsProps } from "./sticker-ui.types";

const WHITE = "#FFFFFF";

/**
 * The die-cut edge's color, for stickers drawn with one. A pick is shown while dragging and
 * applied when it ends (each color is a picture of its own in the file).
 */
export function StickerEdgeField({ stickers }: StickerFieldsProps) {
  const engine = useDesignEngine();
  const [draft, setDraft] = useState<string | null>(null);
  const edged = stickers.filter(canRestyleEdge);
  const [first] = edged;
  if (!first) return null;
  const current = first.edgeColor ?? WHITE;

  const apply = (edgeColor: string | null) => {
    void stickerEdgePatches(engine.doc, edged, edgeColor).then(
      (patches) => {
        setDraft(null);
        if (patches.size === 0) return;
        engine.doc.checkpoint();
        engine.doc.updateMany(patches);
      },
      (error: unknown) => {
        setDraft(null);
        notifyError("Couldn't change the edge color", error);
      },
    );
  };

  return (
    <div className="flex items-center gap-1">
      <div className="min-w-0 flex-1">
        <EffectColorField
          label="Edge"
          color={draft ?? current}
          onChange={({ color }, { done }) => {
            setDraft(color);
            if (done) apply(color.toUpperCase() === WHITE ? null : color.toUpperCase());
          }}
        />
      </div>
      {edged.some((sticker) => sticker.edgeColor) && (
        <PanelIconButton label="Reset the edge to white" onClick={() => apply(null)}>
          <RotateCcw />
        </PanelIconButton>
      )}
    </div>
  );
}
