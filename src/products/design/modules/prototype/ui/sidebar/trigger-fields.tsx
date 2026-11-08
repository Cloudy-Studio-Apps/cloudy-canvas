import { CommitInput } from "@canvas-ui";
import { NumberField } from "@design/ui/components/panel";
import { SelectField } from "@shared/ui/kit";
import { MAX_TRIGGER_DELAY, PROTOTYPE_TRIGGERS } from "../../prototype.constants";
import { t } from "../../prototype.i18n";
import { InteractionRow } from "./interaction-row";
import type { InteractionFieldsProps } from "./interaction-fields.types";

const TRIGGER_CHOICES = PROTOTYPE_TRIGGERS.map((value) => ({
  value,
  label: t(`trigger.${value}`),
}));

/** The trigger's select, and the key of a `key` trigger or the wait of a `delay` one. */
export function TriggerFields({ ix, onChange }: InteractionFieldsProps) {
  return (
    <>
      <InteractionRow label={t("card.trigger")}>
        <SelectField
          label={t("card.trigger")}
          value={ix.trigger}
          options={TRIGGER_CHOICES}
          onChange={(trigger) => onChange({ trigger })}
        />
      </InteractionRow>
      {ix.trigger === "key" && (
        <InteractionRow label={t("card.key")}>
          <CommitInput
            aria-label={t("card.key")}
            className="font-mono"
            value={ix.key ?? ""}
            onCommit={(key) => {
              if (key.trim() === "") return t("card.keyEmpty");
              onChange({ key });
            }}
          />
        </InteractionRow>
      )}
      {ix.trigger === "delay" && (
        <InteractionRow label={t("card.after")}>
          <NumberField
            prefix="ms"
            label={t("card.after")}
            value={ix.delay ?? 0}
            min={0}
            max={MAX_TRIGGER_DELAY}
            step={100}
            decimals={0}
            onCommit={(delay) => onChange({ delay })}
          />
        </InteractionRow>
      )}
    </>
  );
}
