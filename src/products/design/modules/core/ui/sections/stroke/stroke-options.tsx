import type { DashStyle } from "./stroke-dashes.types";
import { CapIcon, JoinIcon } from "./stroke-icons";

// The choices of a stroke's settings, shared by the Strokes section and stroke styles.

export const DASH_STYLES = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
  { value: "custom", label: "Custom" },
] as const satisfies readonly { value: DashStyle; label: string }[];

export const CAPS = [
  { value: "none", label: "No cap", icon: <CapIcon cap="none" /> },
  { value: "round", label: "Round cap", icon: <CapIcon cap="round" /> },
  { value: "square", label: "Square cap", icon: <CapIcon cap="square" /> },
];

export const JOINS = [
  { value: "miter", label: "Miter join", icon: <JoinIcon join="miter" /> },
  { value: "bevel", label: "Bevel join", icon: <JoinIcon join="bevel" /> },
  { value: "round", label: "Round join", icon: <JoinIcon join="round" /> },
];

export const ALIGNS = [
  { value: "inside", label: "Inside" },
  { value: "center", label: "Center" },
  { value: "outside", label: "Outside" },
] as const;
