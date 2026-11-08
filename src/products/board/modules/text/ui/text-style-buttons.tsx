import { AlignCenter, AlignLeft, AlignRight, Bold, Italic } from "lucide-react";

import { OptionButton, PanelDivider } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
import { TEXT_ALIGNS } from "../text.defaults";
import { t } from "../text.i18n";

const ALIGN_ICONS = { left: AlignLeft, center: AlignCenter, right: AlignRight } as const;

/** Bold and italic toggles, then the alignment of a label's lines. */
export function TextStyleButtons() {
  const engine = useBoardEngine();
  const { textBold, textItalic, textAlign } = useBoardState((state) => state.options);

  return (
    <>
      <OptionButton
        aria-label={t("options.bold")}
        title={t("options.bold")}
        aria-pressed={textBold}
        selected={textBold}
        onClick={() => engine.setToolOptions({ textBold: !textBold })}
      >
        <Bold size={16} />
      </OptionButton>
      <OptionButton
        aria-label={t("options.italic")}
        title={t("options.italic")}
        aria-pressed={textItalic}
        selected={textItalic}
        onClick={() => engine.setToolOptions({ textItalic: !textItalic })}
      >
        <Italic size={16} />
      </OptionButton>
      <PanelDivider />
      {TEXT_ALIGNS.map((align) => {
        const Icon = ALIGN_ICONS[align];
        const label = t(`options.align.${align}`);
        return (
          <OptionButton
            key={align}
            aria-label={label}
            title={label}
            selected={textAlign === align}
            onClick={() => engine.setToolOptions({ textAlign: align })}
          >
            <Icon size={16} />
          </OptionButton>
        );
      })}
    </>
  );
}
