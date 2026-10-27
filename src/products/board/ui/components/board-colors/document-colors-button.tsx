import { Hexagon } from "lucide-react";

import { OptionButton, TokenSwatch, useDocumentTokens, VariablePicker } from "@canvas-ui";
import { Button } from "@shared/ui/components/ui/button";
import { cn } from "@shared/ui/lib/utils";
import { useBoardEngine } from "@board/ui/board-engine-context";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { boardColorValue } from "./board-color-value";
import type { DocumentColorsButtonProps } from "./board-colors.types";
import { t } from "../../board-ui.i18n";

/**
 * The first swatch of a board color bar: the board's colors (its color variables), by collection
 * and group. Picked, it shows the variable's color with a variable mark.
 */
export function DocumentColorsButton({
  token,
  scopes,
  onPick,
  shape = "square",
}: DocumentColorsButtonProps) {
  const engine = useBoardEngine();
  const { store } = useDocumentTokens();
  const setColorsOpen = useBoardPanelStore((state) => state.setColorsOpen);
  const bound = token ? store.variable(token) : null;
  const color = bound && token ? boardColorValue(engine.doc, token) : null;
  const label = bound
    ? t("colors.documentColor", { name: bound.name })
    : t("colors.documentColors");
  return (
    <VariablePicker
      type="color"
      scopes={scopes}
      value={token}
      modes={{}}
      onPick={onPick}
      side="top"
      align="start"
      footer={
        <Button
          variant="ghost"
          size="xs"
          className="w-full justify-start"
          onClick={() => setColorsOpen(true)}
        >
          {t("colors.manage")}
        </Button>
      }
    >
      <OptionButton selected={!!bound} aria-label={label} title={label}>
        {color ? (
          <span
            className={cn(
              "relative ring-2 ring-primary ring-offset-1 ring-offset-surface",
              shape === "circle" ? "rounded-full" : "rounded-xs",
            )}
          >
            <TokenSwatch color={color} round={shape === "circle"} className="size-5" />
            <Hexagon className="absolute -right-1 -bottom-1 size-2.5 fill-surface text-foreground" />
          </span>
        ) : (
          <Hexagon className="size-4 text-muted-foreground" />
        )}
      </OptionButton>
    </VariablePicker>
  );
}
