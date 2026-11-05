import { useScrubUndo } from "@canvas-ui";
import { NumberInput } from "@shared/ui/kit";
import { DEFAULT_DESIGN_LIMIT } from "../../repeat";
import { SettingRow } from "./setting-row";
import type { LimitFieldsProps } from "./limit-fields.types";
import { t } from "../../data.i18n";

const CAPS = ["limit", "designLimit"] as const;

/**
 * Limit (rows everywhere, the export too) and "While designing, show" (copies made in the
 * document only); emptied, Limit is off and the design cap goes back to its default
 * (`DEFAULT_DESIGN_LIMIT` unless `designDefault` says otherwise). A drag of either is one undo step.
 */
export function LimitFields({
  repeat,
  apply,
  designLabel = t("repeat.designLimit"),
  designDefault = DEFAULT_DESIGN_LIMIT,
}: LimitFieldsProps) {
  const scrubUndo = useScrubUndo();
  return (
    <>
      {CAPS.map((cap) => {
        const label = cap === "designLimit" ? designLabel : t("repeat.limit");
        return (
          <SettingRow key={cap} label={label}>
            <NumberInput
              label={label}
              value={repeat[cap] ?? null}
              placeholder={cap === "designLimit" ? String(designDefault) : t("repeat.none")}
              min={1}
              decimals={0}
              onChange={(value) => apply({ [cap]: value })}
              onClear={() => apply({ [cap]: undefined })}
              className="min-w-0 flex-1"
              {...scrubUndo}
            />
          </SettingRow>
        );
      })}
    </>
  );
}
