import { cn } from "@shared/ui/lib/utils";
import type { WheelSlotProps } from "./sticker-picker.types";
import { slotOffset, WHEEL } from "./wheel-geometry";
import { slotTiming, WHEEL_MOTION } from "./wheel-motion";

/** A sticker on the wheel's ring. */
export function WheelSlot({ sticker, slot, active, onPick }: WheelSlotProps) {
  const { x, y } = slotOffset(slot);
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: a sticker on the wheel
    <button
      type="button"
      title={sticker.label}
      aria-label={sticker.label}
      aria-pressed={active}
      onClick={() => onPick(sticker)}
      style={{
        ...slotTiming(slot),
        width: WHEEL.slotSize,
        height: WHEEL.slotSize,
        left: WHEEL.size / 2 + x - WHEEL.slotSize / 2,
        top: WHEEL.size / 2 + y - WHEEL.slotSize / 2,
      }}
      className={cn(
        WHEEL_MOTION.popClass,
        "group absolute flex cursor-pointer items-center justify-center rounded-md transition-colors outline-none hover:bg-hover focus-visible:ring-[3px] focus-visible:ring-ring/40",
        active && "bg-primary-soft hover:bg-primary-soft",
      )}
    >
      <img
        src={sticker.url}
        alt=""
        draggable={false}
        className="size-10 object-contain transition-transform group-hover:scale-115"
      />
    </button>
  );
}
