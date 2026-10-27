import { Grid2x2, PanelBottom, PanelLeft, PanelRight, PanelTop, Square } from "lucide-react";

import { PanelIconButton, sharedValue } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@shared/ui/kit";
import { sidesMode, sidesPatch } from "./stroke-sides";
import type { StrokeSidesMenuProps } from "./stroke-sides-menu.types";
import type { StrokeSidesMode } from "./stroke-sides.types";
import { t } from "../../../core.i18n";

const MODES = [
  { mode: "all", label: t("stroke.sides.all"), icon: Square },
  { mode: "top", label: t("stroke.sides.top"), icon: PanelTop },
  { mode: "bottom", label: t("stroke.sides.bottom"), icon: PanelBottom },
  { mode: "left", label: t("stroke.sides.left"), icon: PanelLeft },
  { mode: "right", label: t("stroke.sides.right"), icon: PanelRight },
  { mode: "custom", label: t("stroke.sides.custom"), icon: Grid2x2 },
] as const satisfies readonly { mode: StrokeSidesMode; label: string; icon: unknown }[];

/** Which sides of a box the stroke is on: all, one, or each with its own weight. */
export function StrokeSidesMenu({ nodes }: StrokeSidesMenuProps) {
  const edit = useEditNodes();
  const current = sharedValue(nodes, sidesMode);
  const shown = MODES.find((entry) => entry.mode === current) ?? MODES[0];
  const Icon = shown.icon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span>
          <PanelIconButton
            label={t("stroke.sidesLabel", { current: current ? shown.label : t("mixed") })}
          >
            <Icon />
          </PanelIconButton>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuRadioGroup
          value={current ?? ""}
          onValueChange={(mode) => edit(nodes, (node) => sidesPatch(mode as StrokeSidesMode, node))}
        >
          {MODES.map(({ mode, label, icon: ModeIcon }) => (
            <DropdownMenuRadioItem key={mode} value={mode} className="gap-2 text-xs">
              <ModeIcon className="size-3.5" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
