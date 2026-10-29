import { ExtensionIconView } from "@canvas-ui";
import { SealLogo } from "@shared/ui/brand/seal-logo";
import { IconButton } from "@shared/ui/kit";
import { t } from "../../viewer.i18n";
import type { BrandBarProps } from "./brand-bar.types";
import { TitlePopover } from "./title-popover";

/**
 * The viewer's top-left card: the seal and "Cloudy Canvas", the board's title (its popover holds
 * the description), "view only", then the parts' toggles.
 */
export function BrandBar({ meta, toggles }: BrandBarProps) {
  return (
    <div className="pointer-events-auto absolute top-3 left-3 flex items-center gap-2 rounded-lg border bg-surface px-2.5 py-1.5 shadow-md">
      <SealLogo size={20} variant="mark" />
      <span className="text-sm font-semibold">{t("bar.brand")}</span>
      <span aria-hidden className="text-muted-foreground">
        /
      </span>
      <TitlePopover meta={meta} />
      <span className="text-xs text-muted-foreground">{t("bar.viewOnly")}</span>
      {toggles.length > 0 && <span aria-hidden className="mx-0.5 h-4 w-px bg-border" />}
      {toggles.map(({ id, button, active, onToggle }) => (
        <IconButton key={id} label={button.label} active={active} size="sm" onClick={onToggle}>
          <ExtensionIconView icon={button.icon} />
        </IconButton>
      ))}
    </div>
  );
}
