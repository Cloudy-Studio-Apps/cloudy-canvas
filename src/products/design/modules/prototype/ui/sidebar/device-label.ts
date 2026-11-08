import { t } from "../../prototype.i18n";

/** A device's label with its size, in the creator's language (the ids are `PROTOTYPE_DEVICES`'). */
export function deviceLabel(device: string): string {
  switch (device) {
    case "iphone-16":
      return t("device.iphone-16");
    case "iphone-se":
      return t("device.iphone-se");
    case "pixel-9":
      return t("device.pixel-9");
    case "ipad-air":
      return t("device.ipad-air");
    case "galaxy-tab":
      return t("device.galaxy-tab");
    case "window-mac":
      return t("device.window-mac");
    case "window-windows":
      return t("device.window-windows");
    case "window-linux":
      return t("device.window-linux");
    case "browser-1280":
      return t("device.browser-1280");
    case "browser-1440":
      return t("device.browser-1440");
    case "browser-fit":
      return t("device.browser-fit");
    default:
      return device;
  }
}
