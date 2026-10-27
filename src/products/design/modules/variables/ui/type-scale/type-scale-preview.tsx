import { resolveVariable } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { styleGroupOf, typeScaleSteps } from "../../type-scale";
import type { TypeScalePreviewProps } from "./type-scale-ui.types";
import { t } from "../../variables.i18n";

/** The scale as it will look: each step's sample in its size, weight and font, largest first. */
export function TypeScalePreview({ settings }: TypeScalePreviewProps) {
  const { store } = useDocumentTokens();
  const resolved =
    "variable" in settings.font ? resolveVariable(store, settings.font.variable, {}) : null;
  const family =
    "name" in settings.font
      ? settings.font.name
      : resolved?.type === "string"
        ? resolved.string
        : "Inter";
  const steps = typeScaleSteps(settings).reverse();
  const group = styleGroupOf(settings.group || "type");
  return (
    <div className="flex max-h-96 flex-col gap-3 overflow-y-auto rounded-md border bg-surface p-3">
      {steps.map((step) => (
        <div key={step.name} className="flex min-w-0 items-baseline gap-3">
          <span className="w-24 shrink-0 text-xs text-muted-foreground">
            {group}/{step.name} · {step.size}
          </span>
          <span
            className="truncate text-foreground"
            style={{
              fontFamily: family,
              fontSize: step.size,
              fontWeight: Number(step.weight),
              lineHeight: step.lineHeight,
            }}
          >
            {t("typeScale.sample")}
          </span>
        </div>
      ))}
    </div>
  );
}
