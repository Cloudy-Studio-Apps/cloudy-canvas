import { ArrowLeft, ArrowRight, Globe, Minus, RotateCcw, Square, X } from "lucide-react";

import type { DeviceChromeProps } from "./device-frame.types";

// A picture of a device's own bars, like canvas content: its colors are literal and the app's
// chrome rules (tokens, radii) don't apply.
const BAR =
  "flex h-8 shrink-0 items-center gap-2 border-b border-[oklch(0.86_0.01_256)] px-2.5 text-xs text-[oklch(0.35_0.01_256)]";
/** A macOS window's close, minimize and zoom buttons. */
const TRAFFIC_LIGHTS = ["oklch(0.7 0.16 25)", "oklch(0.82 0.14 85)", "oklch(0.72 0.15 145)"];

/**
 * The device's bar above the screen: nothing on a phone or tablet, an app window's title bar (the
 * macOS buttons, or Windows' and Linux's on the right), or a browser's buttons and address bar.
 */
export function DeviceChrome({ flow, address }: DeviceChromeProps) {
  if (flow.platform === "mobile" || flow.platform === "tablet") return null;
  if (flow.platform === "web") {
    return (
      <div className={BAR}>
        <ArrowLeft className="size-3.5" />
        <ArrowRight className="size-3.5" />
        <RotateCcw className="size-3.5" />
        <span className="flex h-[22px] min-w-0 flex-1 items-center gap-1.5 rounded-sm bg-[oklch(1_0_0)] px-2.5 text-[oklch(0.45_0.01_256)]">
          <Globe className="size-3.5 shrink-0" />
          <span className="truncate">{address}</span>
        </span>
      </div>
    );
  }
  if (flow.device === "window-mac") {
    return (
      <div className={BAR}>
        <span className="flex w-12 gap-1.5">
          {TRAFFIC_LIGHTS.map((color) => (
            <i key={color} className="size-[11px] rounded-full" style={{ background: color }} />
          ))}
        </span>
        <span className="min-w-0 flex-1 truncate text-center">{flow.name}</span>
        <span className="w-12" />
      </div>
    );
  }
  return (
    <div className={BAR}>
      <span className="min-w-0 flex-1 truncate">{flow.name}</span>
      <span className="flex gap-4">
        <Minus className="size-3.5" />
        <Square className="size-3" />
        <X className="size-3.5" />
      </span>
    </div>
  );
}
