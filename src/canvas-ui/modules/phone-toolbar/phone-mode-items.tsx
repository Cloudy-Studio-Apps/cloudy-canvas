import { DialogClose } from "@shared/ui/components/ui/dialog";
import { BadgedIcon } from "../badged-icon";
import { useModeToolbarItem } from "../use-mode-toolbar-item";
import { PhoneToolCell } from "./phone-tool-cell";
import type { PhoneModeItemProps, PhoneModeItemsProps } from "./phone-toolbar.types";

/** A mode's toolbar items in the sheet; its dividers have no place in a grid. */
export function PhoneModeItems({ items }: PhoneModeItemsProps) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {items.map((item, index) =>
        item === "divider" ? null : <PhoneModeItem key={index} item={item} />,
      )}
    </div>
  );
}

function PhoneModeItem({ item }: PhoneModeItemProps) {
  const view = useModeToolbarItem(item);
  if (!view) return null;
  return (
    <DialogClose asChild>
      <PhoneToolCell
        icon={<BadgedIcon icon={view.icon} badge={view.badge} />}
        label={view.label}
        active={view.active}
        disabled={view.disabled}
        onClick={view.run}
      />
    </DialogClose>
  );
}
