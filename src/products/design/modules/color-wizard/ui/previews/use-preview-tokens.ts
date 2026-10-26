import { useMemo } from "react";

import { themeColor, wizardTypeSteps, type ThemeMode } from "../..";
import { useColorWizardStore, useWizardTheme } from "../store";
import type { PreviewTokens } from "./preview.types";

const FALLBACK = {
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--destructive)",
};

/** The Theme in one mode as the sample designs read it. */
export function usePreviewTokens(mode: ThemeMode): PreviewTokens {
  const { theme, colors } = useWizardTheme();
  const type = useColorWizardStore((s) => s.type);
  return useMemo(() => {
    const t = (name: string) =>
      themeColor(theme, name, mode) ??
      (FALLBACK as Record<string, string>)[name] ??
      themeColor(theme, "primary", mode) ??
      "var(--primary)";
    const deco = colors.filter((c) => !c.added || c.name === "neutral").map((c) => c.hex);
    if (deco.length < 2) deco.push(t("primary"), t("primary-soft"));
    const steps = wizardTypeSteps(type);
    const heading = type.enabled ? type.heading : "Inter";
    const body = type.enabled ? type.body : "Inter";
    const text = (step: string, max?: number) => {
      const s = steps.find((x) => x.name === step);
      if (!s) return {};
      return {
        fontFamily: `"${s.heading ? heading : body}"`,
        fontSize: Math.min(s.size, max ?? s.size),
        lineHeight: s.lineHeight,
        fontWeight: Number(s.weight),
      };
    };
    const soft = (name: string, percent = 14) =>
      `color-mix(in oklch, ${t(name)} ${percent}%, ${t("surface")})`;
    return { t, deco, text, body: `"${body}"`, soft };
  }, [theme, colors, type, mode]);
}
