import { ColorField } from "@canvas-ui";
import { Eye, EyeOff, Minus, MoveHorizontal } from "lucide-react";
import { useRef } from "react";

import type { ElementPatch } from "@canvas";
import type { ColorChangeInfo } from "@canvas-ui";
import type { DesignNode } from "../../core";
import type { StickerNodeElement, StickerOutline } from "../sticker.types";
import { ScrubField } from "../../effects/ui";
import { PanelIconButton } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import type { StickerFieldsProps } from "./sticker-ui.types";
import { t } from "../sticker.i18n";

/** The outline round stickers' shape: its color, width, visibility, and removing it. */
export function StickerOutlineFields({ stickers }: StickerFieldsProps) {
  const edit = useEditNodes();
  const dragging = useRef(false);
  const outline = stickers.find((sticker) => sticker.outline)?.outline;
  if (!outline) return null;

  const change = (
    patch: Partial<StickerOutline> | null,
    info: ColorChangeInfo = { done: true },
  ) => {
    const checkpoint = !dragging.current;
    dragging.current = !info.done;
    edit(
      stickers,
      (node) => {
        const own = (node as StickerNodeElement).outline;
        const next = patch && own ? { ...own, ...patch } : patch ? { ...outline, ...patch } : null;
        return { outline: next } as ElementPatch<DesignNode>;
      },
      { checkpoint },
    );
  };

  return (
    <div className="flex items-center gap-1">
      <div className="min-w-0 flex-1">
        <ColorField
          label={t("outline.label")}
          color={outline.color}
          onChange={({ color }, info) => change({ color: color.toUpperCase() }, info)}
        />
      </div>
      <ScrubField
        className="w-16 shrink-0"
        prefix={<MoveHorizontal />}
        label={t("outline.width")}
        value={outline.width}
        min={0}
        max={64}
        onChange={(width, info) => change({ width }, info)}
      />
      <PanelIconButton
        label={outline.visible ? t("outline.hide") : t("outline.show")}
        onClick={() => change({ visible: !outline.visible })}
      >
        {outline.visible ? <Eye /> : <EyeOff />}
      </PanelIconButton>
      <PanelIconButton label={t("outline.remove")} onClick={() => change(null)}>
        <Minus />
      </PanelIconButton>
    </div>
  );
}
