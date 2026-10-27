import { DOCUMENT_TOKENS } from "@canvas";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { InspectorSection } from "../window/inspector/inspector-section";
import { ContrastRow } from "./contrast-row";
import type { ContrastPairsListProps } from "./contrast-ui.types";
import { PartnerPicker } from "./partner-picker";
import { useContrastChecks } from "./use-contrast-checks";
import { t } from "../../variables.i18n";

/**
 * A color's contrast: every pair it's in (declared, or found by scope: text colors on fills) with
 * its WCAG grade in each mode, and "+ Pair with…" to declare another.
 */
export function ContrastPairsList({ variable }: ContrastPairsListProps) {
  const engine = useDesignEngine();
  const checks = useContrastChecks().filter(
    (check) => check.text === variable.id || check.surface === variable.id,
  );
  const unpair = (other: string) =>
    engine.service(DOCUMENT_TOKENS).updateVariable(variable.id, {
      contrastWith: (variable.contrastWith ?? []).filter((id) => id !== other),
    });
  return (
    <InspectorSection title={t("contrast.title")}>
      <div className="flex flex-col gap-1.5">
        {checks.length === 0 && (
          <p className="text-xs text-subtle-foreground">{t("contrast.noPairs")}</p>
        )}
        {checks.map((check) => (
          <ContrastRow
            key={`${check.text}|${check.surface}`}
            check={check}
            from={variable.id}
            onRemove={
              check.declared && check.text === variable.id ? () => unpair(check.surface) : undefined
            }
          />
        ))}
        <div>
          <PartnerPicker variable={variable} />
        </div>
      </div>
    </InspectorSection>
  );
}
