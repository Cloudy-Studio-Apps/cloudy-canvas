import type { PaintTab } from "./paint-picker.types";
import { t } from "../../design-ui.i18n";

/** The picker's tabs, one per kind of paint, in Figma's order. */
export const PAINT_TABS: readonly PaintTab[] = [
  { id: "solid", label: t("paintTypes.solid"), ready: true },
  { id: "linear", label: t("paintTypes.linear"), ready: true },
  { id: "radial", label: t("paintTypes.radial"), ready: true },
  { id: "angular", label: t("paintTypes.angular"), ready: true },
  { id: "diamond", label: t("paintTypes.diamond"), ready: true },
  { id: "image", label: t("paintTypes.image"), ready: true },
  { id: "pattern", label: t("paintTypes.pattern"), ready: false },
];
