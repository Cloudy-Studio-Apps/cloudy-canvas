import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { stickerCatalog } from "@shared/core";
import { useStickerRecentsStore, WHEEL_SLOTS } from "@shared/stores/sticker-recents-store";
import { cn } from "@shared/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { StickerPanel } from "./sticker-panel";
import type { StickerWheelProps } from "./sticker-picker.types";
import { usePickSticker } from "./use-pick-sticker";
import { useStickerLookup } from "./use-sticker-lookup";
import { slotOffset, WHEEL } from "./wheel-geometry";
import { popTiming, WHEEL_MOTION } from "./wheel-motion";
import { WheelSlot } from "./wheel-slot";
import { wheelSlots } from "./wheel-slots";

const CENTER_ART = stickerCatalog.get("seal:happy");

/**
 * The sticker tool's options: the recently used stickers on a ring, and in the middle a button that
 * opens every sticker, emoji and custom picture. Products show it as their sticker tool's panel.
 */
export function StickerWheel({ activeId, onPicked }: StickerWheelProps) {
  const recents = useStickerRecentsStore((state) => state.recents);
  const lookup = useStickerLookup(recents);
  const slots = useMemo(() => wheelSlots(recents, lookup), [recents, lookup]);
  const pick = usePickSticker(onPicked);
  const [open, setOpen] = useState(false);

  // The tool always has something to stamp: the first slot until another one is picked.
  const first = slots[0];
  useEffect(() => {
    if (!activeId && first) void pick(first);
  }, [activeId, first, pick]);

  const half = WHEEL.size / 2;
  const inner = WHEEL.centerSize / 2 + 4;

  return (
    <div
      role="group"
      aria-label="Stickers"
      className={cn(
        WHEEL_MOTION.wheelClass,
        "pointer-events-auto relative origin-bottom rounded-full border bg-surface shadow-lifted",
      )}
      style={{
        ...popTiming(WHEEL_MOTION.wheel.durationMs, WHEEL_MOTION.wheel.delayMs),
        width: WHEEL.size,
        height: WHEEL.size,
      }}
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 text-border"
        viewBox={`0 0 ${WHEEL.size} ${WHEEL.size}`}
      >
        {Array.from({ length: WHEEL_SLOTS }, (_, i) => {
          const from = slotOffset(i + 0.5, inner);
          const to = slotOffset(i + 0.5, half - 1);
          return (
            <line
              key={i}
              x1={half + from.x}
              y1={half + from.y}
              x2={half + to.x}
              y2={half + to.y}
              stroke="currentColor"
            />
          );
        })}
      </svg>
      {slots.map((sticker, slot) => (
        <WheelSlot
          key={sticker.id}
          sticker={sticker}
          slot={slot}
          active={sticker.id === activeId}
          onPick={(picked) => void pick(picked)}
        />
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the wheel's center button */}
          <button
            type="button"
            title="All stickers"
            aria-label="All stickers"
            style={{
              ...popTiming(WHEEL_MOTION.center.durationMs, WHEEL_MOTION.center.delayMs),
              width: WHEEL.centerSize,
              height: WHEEL.centerSize,
              left: half - WHEEL.centerSize / 2,
              top: half - WHEEL.centerSize / 2,
            }}
            className={cn(
              WHEEL_MOTION.popClass,
              "group absolute flex cursor-pointer items-center justify-center rounded-full border bg-surface-sunken transition-colors outline-none hover:bg-hover focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[state=open]:bg-primary-soft",
            )}
          >
            {CENTER_ART && (
              <img
                src={CENTER_ART.url}
                alt=""
                draggable={false}
                className="size-14 object-contain transition-transform group-hover:scale-110"
              />
            )}
            <span className="absolute right-2 bottom-2 flex size-5 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-xs">
              <Plus className="size-3.5" />
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" sideOffset={10} className="w-[372px] p-0">
          <StickerPanel
            activeId={activeId}
            onPick={(sticker) => {
              void pick(sticker, true);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
