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
import { Button } from "@shared/ui/kit";
import { StickerEdgeField } from "./sticker-edge-field";
import { StickerOutlineFields } from "./sticker-outline-fields";
import { t } from "../sticker.i18n";

/** For selected stickers: the die-cut edge's color, an outline, and Convert to vectors. */
export function StickerSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const edit = useEditNodes();
  const stickers = nodes as readonly StickerNodeElement[];
  const outlined = stickers.some((sticker) => sticker.outline);
  const convertible = stickers.some((sticker) => canConvertSticker(engine.doc, sticker));

  return (
    <PanelSection
      title={t("section.title")}
      actions={
        !outlined && (
          <PanelAddButton
            label={t("section.addOutline")}
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
          title={convertible ? t("section.convertHint") : t("section.notConvertible")}
          onClick={() => engine.commands.stickerToVectors?.()}
        >
          <Shapes />
          {t("section.convert")}
        </Button>
      </div>
    </PanelSection>
  );
}
