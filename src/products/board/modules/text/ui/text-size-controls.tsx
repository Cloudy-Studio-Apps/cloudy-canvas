import { Type } from "lucide-react";

import { TEXT_SIZES } from "../../../palette";
import { OptionButton, useScrubUndo } from "@canvas-ui";
import { NumberInput } from "@shared/ui/kit";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
import { TEXT_DEFAULTS } from "../text.defaults";
import { t } from "../text.i18n";

/** The icon size of the smallest and largest preset, so each reads bigger than the last. */
const ICON_MIN = 11;
const ICON_STEP = 2;

/** Font size presets, plus the exact size (typed, stepped or scrubbed). */
export function TextSizeControls() {
  const engine = useBoardEngine();
  const textSize = useBoardState((state) => state.options.textSize);
  const scrubUndo = useScrubUndo();

  return (
    <>
      {TEXT_SIZES.map((size, i) => {
        const label = t(`options.size.${size.id}`);
        return (
          <OptionButton
            key={size.id}
            aria-label={label}
            title={label}
            selected={textSize === size.value}
            onClick={() => engine.setToolOptions({ textSize: size.value })}
          >
            <Type size={ICON_MIN + i * ICON_STEP} />
          </OptionButton>
        );
      })}
      <NumberInput
        label={t("options.fontSize")}
        value={textSize}
        min={TEXT_DEFAULTS.minFontSize}
        max={TEXT_DEFAULTS.maxFontSize}
        decimals={0}
        className="w-16"
        onChange={(value) => engine.setToolOptions({ textSize: value })}
        {...scrubUndo}
      />
    </>
  );
}
