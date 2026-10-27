import type { DashStyle } from "./stroke-dashes.types";
import { CapIcon, JoinIcon } from "./stroke-icons";
import { t } from "../../../core.i18n";

// The choices of a stroke's settings, shared by the Strokes section and stroke styles.

export const DASH_STYLES = [
  { value: "solid", label: t("stroke.dash.solid") },
  { value: "dashed", label: t("stroke.dash.dashed") },
  { value: "dotted", label: t("stroke.dash.dotted") },
  { value: "custom", label: t("stroke.dash.custom") },
] as const satisfies readonly { value: DashStyle; label: string }[];

export const CAPS = [
  { value: "none", label: t("stroke.caps.none"), icon: <CapIcon cap="none" /> },
  { value: "round", label: t("stroke.caps.round"), icon: <CapIcon cap="round" /> },
  { value: "square", label: t("stroke.caps.square"), icon: <CapIcon cap="square" /> },
];

export const JOINS = [
  { value: "miter", label: t("stroke.joins.miter"), icon: <JoinIcon join="miter" /> },
  { value: "bevel", label: t("stroke.joins.bevel"), icon: <JoinIcon join="bevel" /> },
  { value: "round", label: t("stroke.joins.round"), icon: <JoinIcon join="round" /> },
];

export const ALIGNS = [
  { value: "inside", label: t("stroke.align.inside") },
  { value: "center", label: t("stroke.align.center") },
  { value: "outside", label: t("stroke.align.outside") },
] as const;
