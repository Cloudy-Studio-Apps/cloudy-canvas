import type { LayerBlendMode } from "@design";
import { t } from "../../design-ui.i18n";

/** Figma's blend menu: its groups in order, each mode with its label. */
export const BLEND_MODE_GROUPS: readonly (readonly { value: LayerBlendMode; label: string }[])[] = [
  [
    { value: "pass-through", label: t("blendModes.passThrough") },
    { value: "normal", label: t("blendModes.normal") },
  ],
  [
    { value: "darken", label: t("blendModes.darken") },
    { value: "multiply", label: t("blendModes.multiply") },
    { value: "plus-darker", label: t("blendModes.plusDarker") },
    { value: "color-burn", label: t("blendModes.colorBurn") },
  ],
  [
    { value: "lighten", label: t("blendModes.lighten") },
    { value: "screen", label: t("blendModes.screen") },
    { value: "plus-lighter", label: t("blendModes.plusLighter") },
    { value: "color-dodge", label: t("blendModes.colorDodge") },
  ],
  [
    { value: "overlay", label: t("blendModes.overlay") },
    { value: "soft-light", label: t("blendModes.softLight") },
    { value: "hard-light", label: t("blendModes.hardLight") },
  ],
  [
    { value: "difference", label: t("blendModes.difference") },
    { value: "exclusion", label: t("blendModes.exclusion") },
  ],
  [
    { value: "hue", label: t("blendModes.hue") },
    { value: "saturation", label: t("blendModes.saturation") },
    { value: "color", label: t("blendModes.color") },
    { value: "luminosity", label: t("blendModes.luminosity") },
  ],
];
