import { MoveHorizontal } from "lucide-react";

import { OptionButton } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
import { t } from "../text.i18n";

/**
 * Auto width (sized to its text) on, or off: the label keeps its width and its lines wrap.
 * Resizing a label turns it off.
 */
export function TextWidthButton() {
  const engine = useBoardEngine();
  const autoWidth = useBoardState((state) => state.options.textAutoWidth);
  const label = t("options.autoWidth");

  return (
    <OptionButton
      aria-label={label}
      title={autoWidth ? label : t("options.fixedWidth")}
      aria-pressed={autoWidth}
      selected={autoWidth}
      onClick={() => engine.setToolOptions({ textAutoWidth: !autoWidth })}
    >
      <MoveHorizontal size={16} />
    </OptionButton>
  );
}
