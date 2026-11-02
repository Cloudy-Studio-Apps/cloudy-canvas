import { ExtensionIconView } from "./extension-icon-view";
import type { BadgedIconProps } from "./mode-toolbar.types";

/** An item's icon, with its count over the corner when there is one. */
export function BadgedIcon({ icon, badge }: BadgedIconProps) {
  if (!badge) return <ExtensionIconView icon={icon} />;
  return (
    <span className="relative">
      <ExtensionIconView icon={icon} />
      <span className="absolute -top-1.5 -right-2 min-w-3.5 rounded-sm bg-warning px-0.5 text-[9px] leading-3.5 font-semibold text-surface">
        {badge}
      </span>
    </span>
  );
}
