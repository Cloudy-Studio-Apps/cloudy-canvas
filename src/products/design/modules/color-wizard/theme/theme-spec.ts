import type { ModeSet, ThemeMode, ThemeTokenSpec } from "./theme.types";
import { t } from "../color-wizard.i18n";

/** The modes of each choice. */
export const MODE_SETS: Readonly<Record<ModeSet, readonly ThemeMode[]>> = {
  both: ["Light", "Dark"],
  light: ["Light"],
  dark: ["Dark"],
};

/** What a token can be besides a shade of a palette role. */
export const SPECIAL_COLORS: Readonly<Record<string, string>> = {
  white: "#FFFFFF",
  black: "#000000",
};

/** The Theme's tokens, their roles and default shades, as common light and dark themes do. */
export const THEME_SPEC: readonly ThemeTokenSpec[] = [
  {
    name: "background",
    group: "Surfaces",
    description: t("theme.spec.background"),
    role: "neutral",
    Light: 50,
    Dark: 950,
    core: true,
  },
  {
    name: "surface",
    group: "Surfaces",
    description: t("theme.spec.surface"),
    role: "neutral",
    Light: "white",
    Dark: 900,
    core: true,
  },
  {
    name: "border",
    group: "Surfaces",
    description: t("theme.spec.border"),
    role: "neutral",
    Light: 200,
    Dark: 800,
    core: true,
  },
  {
    name: "foreground",
    group: "Text",
    description: t("theme.spec.foreground"),
    role: "neutral",
    Light: 900,
    Dark: 50,
    core: true,
  },
  {
    name: "muted-foreground",
    group: "Text",
    description: t("theme.spec.mutedForeground"),
    role: "neutral",
    Light: 600,
    Dark: 400,
    core: true,
  },
  {
    name: "primary",
    group: "Brand",
    description: t("theme.spec.primary"),
    role: "primary",
    Light: 600,
    Dark: 500,
    core: true,
  },
  {
    name: "primary-foreground",
    group: "Brand",
    description: t("theme.spec.primaryForeground"),
    role: "auto",
    on: "primary",
    Light: null,
    Dark: null,
  },
  {
    name: "primary-soft",
    group: "Brand",
    description: t("theme.spec.primarySoft"),
    role: "primary",
    Light: 100,
    Dark: 900,
    core: true,
  },
  {
    name: "accent",
    group: "Brand",
    description: t("theme.spec.accent"),
    role: ["accent", "secondary"],
    Light: 400,
    Dark: 400,
  },
  {
    name: "success",
    group: "Status",
    description: t("theme.spec.success"),
    role: "success",
    Light: 600,
    Dark: 400,
  },
  {
    name: "warning",
    group: "Status",
    description: t("theme.spec.warning"),
    role: "warning",
    Light: 500,
    Dark: 400,
  },
  {
    name: "error",
    group: "Status",
    description: t("theme.spec.error"),
    role: "error",
    Light: 600,
    Dark: 400,
  },
  {
    name: "info",
    group: "Status",
    description: t("theme.spec.info"),
    role: "info",
    Light: 600,
    Dark: 400,
  },
];

/** The modes a choice gives. */
export const modesOf = (set: ModeSet): ThemeMode[] => [...MODE_SETS[set]];
