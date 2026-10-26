import { onColor, shadesOf } from "../..";
import type { ShadeStripProps } from "./roles.types";

/** A color's 50–950 shades as one strip (a dot on the color itself), or the color alone. */
export function ShadeStrip({ hex, group, shades }: ShadeStripProps) {
  const steps = shades ? shadesOf(hex) : [{ stop: 0, hex, anchor: true }];
  return (
    <div className="flex h-9 min-w-0 overflow-hidden rounded-md border border-border">
      {steps.map((s) => (
        <div
          key={s.stop}
          title={shades ? `${group}/${s.stop} ${s.hex}` : `${group} ${s.hex}`}
          className="relative flex flex-1 items-end justify-center pb-0.5 text-[9px]"
          style={{ background: s.hex, color: onColor(s.hex) }}
        >
          {s.anchor && shades && (
            <span className="absolute top-1 size-1.5 rounded-full bg-current" />
          )}
          {shades ? s.stop : s.hex}
        </div>
      ))}
    </div>
  );
}
