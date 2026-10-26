import { Shapes } from "lucide-react";

import type { ElementPatch } from "@canvas";
import { canConvertSticker } from "../sticker-to-vectors";
import { STICKER_NODE_DEFAULTS } from "../sticker.defaults";
import type { DesignNode } from "../../core";
import type { StickerNodeElement } from "../sticker.types";
import { PanelAddButton, PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import { Button } from "@shared/ui/components/ui/button";
import { StickerEdgeField } from "./sticker-edge-field";
import { StickerOutlineFields } from "./sticker-outline-fields";

/** For selected stickers: the die-cut edge's color, an outline, and Convert to vectors. */
export function StickerSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const edit = useEditNodes();
  const stickers = nodes as readonly StickerNodeElement[];
  const outlined = stickers.some((sticker) => sticker.outline);
  const convertible = stickers.some((sticker) => canConvertSticker(engine.doc, sticker));

  return (
    <PanelSection
      title="Sticker"
      actions={
        !outlined && (
          <PanelAddButton
            label="Add an outline"
            onClick={() =>
              edit(
                stickers,
                () =>
                  ({ outline: { ...STICKER_NODE_DEFAULTS.outline } }) as ElementPatch<DesignNode>,
              )
            }
          />
        )
      }
    >
      <div className="flex flex-col gap-2">
        <StickerEdgeField stickers={stickers} />
        <StickerOutlineFields stickers={stickers} />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={!convertible}
          title={
            convertible
              ? "Turns it into vector layers you can recolor"
              : "Only stickers drawn as SVG can become vectors"
          }
          onClick={() => engine.commands.stickerToVectors?.()}
        >
          <Shapes />
          Convert to vectors
        </Button>
      </div>
    </PanelSection>
  );
}
