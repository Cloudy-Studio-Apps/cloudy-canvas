import type { ModeSet, ThemeMode, ThemeTokenSpec } from "./theme.types";

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
    description: "Page behind everything",
    role: "neutral",
    Light: 50,
    Dark: 950,
    core: true,
  },
  {
    name: "surface",
    group: "Surfaces",
    description: "Cards, panels, menus",
    role: "neutral",
    Light: "white",
    Dark: 900,
    core: true,
  },
  {
    name: "border",
    group: "Surfaces",
    description: "Lines, inputs, dividers",
    role: "neutral",
    Light: 200,
    Dark: 800,
    core: true,
  },
  {
    name: "foreground",
    group: "Text",
    description: "Main text",
    role: "neutral",
    Light: 900,
    Dark: 50,
    core: true,
  },
  {
    name: "muted-foreground",
    group: "Text",
    description: "Secondary text, hints",
    role: "neutral",
    Light: 600,
    Dark: 400,
    core: true,
  },
  {
    name: "primary",
    group: "Brand",
    description: "Main buttons, links, focus",
    role: "primary",
    Light: 600,
    Dark: 500,
    core: true,
  },
  {
    name: "primary-foreground",
    group: "Brand",
    description: "Text on primary",
    role: "auto",
    on: "primary",
    Light: null,
    Dark: null,
  },
  {
    name: "primary-soft",
    group: "Brand",
    description: "Subtle highlights, secondary buttons",
    role: "primary",
    Light: 100,
    Dark: 900,
    core: true,
  },
  {
    name: "accent",
    group: "Brand",
    description: "Badges, highlights",
    role: ["accent", "secondary"],
    Light: 400,
    Dark: 400,
  },
  {
    name: "success",
    group: "Status",
    description: "Confirmations",
    role: "success",
    Light: 600,
    Dark: 400,
  },
  {
    name: "warning",
    group: "Status",
    description: "Cautions",
    role: "warning",
    Light: 500,
    Dark: 400,
  },
  {
    name: "error",
    group: "Status",
    description: "Errors, destructive actions",
    role: "error",
    Light: 600,
    Dark: 400,
  },
  {
    name: "info",
    group: "Status",
    description: "Neutral notices",
    role: "info",
    Light: 600,
    Dark: 400,
  },
];

/** The modes a choice gives. */
export const modesOf = (set: ModeSet): ThemeMode[] => [...MODE_SETS[set]];
