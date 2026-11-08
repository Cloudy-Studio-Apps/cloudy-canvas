import { cn } from "@shared/ui/kit";
import type { PrototypePlatform } from "../../model";
import { DeviceChrome } from "./device-chrome";
import type { DeviceFrameProps } from "./device-frame.types";

// The device round the screen is a picture of a device (like canvas content), so its colors and a
// phone's round corners are literal; the app's chrome rules (tokens, radii) don't apply.
const BODY: Record<PrototypePlatform, string> = {
  mobile: "rounded-[34px] bg-[oklch(0.2_0.01_256)] p-3",
  tablet: "rounded-[24px] bg-[oklch(0.2_0.01_256)] p-[18px]",
  desktop:
    "overflow-hidden rounded-lg border border-[oklch(0.8_0.01_256)] bg-[oklch(0.96_0.005_256)]",
  web: "overflow-hidden rounded-lg border border-[oklch(0.8_0.01_256)] bg-[oklch(0.96_0.005_256)]",
};
const SCREEN: Record<PrototypePlatform, string> = {
  mobile: "rounded-[24px]",
  tablet: "rounded-lg",
  desktop: "",
  web: "",
};

/**
 * The device a flow plays on, round its screen: a phone or a tablet (a bezel), an app window with
 * its title bar, or a browser with its address bar.
 */
export function DeviceFrame({ flow, address, width, height, children }: DeviceFrameProps) {
  return (
    <div className={cn("flex flex-col shadow-popover", BODY[flow.platform])}>
      <DeviceChrome flow={flow} address={address} />
      <div
        className={cn("relative overflow-hidden bg-[oklch(1_0_0)]", SCREEN[flow.platform])}
        style={{ width, height }}
      >
        {children}
      </div>
    </div>
  );
}
