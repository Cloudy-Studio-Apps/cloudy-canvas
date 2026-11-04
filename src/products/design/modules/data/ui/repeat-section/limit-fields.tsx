import { NumberInput } from "@shared/ui/kit";
import { DEFAULT_DESIGN_LIMIT } from "../../repeat";
import { SettingRow } from "./setting-row";
import type { LimitFieldsProps } from "./limit-fields.types";
import { t } from "../../data.i18n";

const CAPS = ["limit", "designLimit"] as const;

/**
 * Limit (rows everywhere, the export too) and "While designing, show" (copies made in the
 * document only); emptied, Limit is off and the design cap goes back to `DEFAULT_DESIGN_LIMIT`.
 */
export function LimitFields({ repeat, apply }: LimitFieldsProps) {
  return (
    <>
      {CAPS.map((cap) => (
        <SettingRow key={cap} label={t(`repeat.${cap}`)}>
          <NumberInput
            label={t(`repeat.${cap}`)}
            value={repeat[cap] ?? null}
            placeholder={cap === "designLimit" ? String(DEFAULT_DESIGN_LIMIT) : t("repeat.none")}
            min={1}
            decimals={0}
            onChange={(value) => apply({ [cap]: value })}
            onClear={() => apply({ [cap]: undefined })}
            className="min-w-0 flex-1"
          />
        </SettingRow>
      ))}
    </>
  );
}
