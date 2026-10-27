import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { clamp } from "@canvas";
import { notifyError } from "@shared/stores/toast-store";
import { extractImageColors, rgbToHex, type PixelData } from "../..";
import { commitPalette, setColors, useColorWizardStore } from "../store";
import type { ImagePinsProps } from "./colors.types";
import { downsample, pixelAt, readPixels } from "./read-pixels";
import { t } from "../../color-wizard.i18n";

/**
 * The image with a numbered pin on each color found in it. Changing the image, the mood or how
 * many colors there are reads it again; dragging a pin samples the spot under it.
 */
export function ImagePins({ url }: ImagePinsProps) {
  const image = useColorWizardStore((s) => s.image);
  const palette = useColorWizardStore((s) => s.palette);
  const set = useColorWizardStore((s) => s.set);
  const [pixels, setPixels] = useState<PixelData | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setPixels(readPixels(img, 640));
      setSrc(url);
    };
    img.onerror = () =>
      notifyError(t("sources.image.readFailed"), new Error("It isn't a picture the app can open."));
    img.src = url;
  }, [url]);

  useEffect(() => {
    if (!pixels) return;
    const key = `${url}|${image.mood}|${palette.length}`;
    if (image.readFrom === key) return;
    const small = downsample(pixels, 96);
    const found = extractImageColors(small, palette.length, image.mood);
    if (!found.length) return;
    setColors(palette.map((c, i) => found[i]?.hex ?? c.hex));
    set({
      image: {
        ...useColorWizardStore.getState().image,
        pins: found.map(({ x, y }) => ({ x, y })),
        readFrom: key,
      },
    });
  }, [pixels, url, image.mood, image.readFrom, palette, set]);

  const drag = (index: number) => (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (!pixels || palette[index]?.locked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const start = useColorWizardStore.getState().palette;
    const target = event.currentTarget;
    const move = (e: PointerEvent) => {
      const rect = box.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
      const state = useColorWizardStore.getState();
      const hex = rgbToHex(pixelAt(pixels, x, y));
      state.set({
        palette: state.palette.map((c, i) => (i === index ? { ...c, hex } : c)),
        image: {
          ...state.image,
          pins: state.image.pins.map((p, i) => (i === index ? { x, y } : p)),
        },
      });
    };
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      const moved = useColorWizardStore.getState().palette;
      useColorWizardStore.getState().set({ palette: start });
      commitPalette(moved);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
  };

  return (
    <div
      ref={box}
      className="relative touch-none overflow-hidden rounded-lg border border-border bg-surface-sunken"
    >
      {src && <img src={src} alt="" className="block w-full select-none" draggable={false} />}
      {image.pins.map((pin, i) =>
        palette[i] ? (
          <span
            key={i}
            role="slider"
            aria-label={t("palette.swatch.colorN", { n: i + 1 })}
            aria-valuenow={i}
            tabIndex={-1}
            onPointerDown={drag(i)}
            className="absolute size-5.5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-surface shadow-popover"
            style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%`, background: palette[i].hex }}
          >
            <span className="absolute -top-4.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-surface [text-shadow:0_1px_2px_var(--foreground)]">
              {i + 1}
            </span>
          </span>
        ) : null,
      )}
    </div>
  );
}
