import { CommitInput } from "@canvas-ui";
import { SelectField } from "@shared/ui/kit";
import { isWebAddress } from "../../model";
import { PROTOTYPE_ACTIONS, PROTOTYPE_TARGET_ACTIONS } from "../../prototype.constants";
import { t } from "../../prototype.i18n";
import { InteractionRow } from "./interaction-row";
import type { ActionFieldsProps } from "./interaction-fields.types";

/**
 * The action's select, and what it needs: the screen to show (`navigate`, `overlay`, `swap`;
 * without another screen those aren't offered) or the address of a `link`.
 */
export function ActionFields({ ix, screens, onChange }: ActionFieldsProps) {
  const choices = PROTOTYPE_ACTIONS.filter(
    (action) =>
      screens.length > 0 || action === ix.action || !PROTOTYPE_TARGET_ACTIONS.includes(action),
  ).map((value) => ({ value, label: t(`action.${value}`) }));
  return (
    <>
      <InteractionRow label={t("card.action")}>
        <SelectField
          label={t("card.action")}
          value={ix.action}
          options={choices}
          onChange={(action) =>
            // A screen-showing action needs one: keep the one it has, else the first.
            onChange(
              PROTOTYPE_TARGET_ACTIONS.includes(action) && !ix.to
                ? { action, to: screens[0]?.value }
                : { action },
            )
          }
        />
      </InteractionRow>
      {PROTOTYPE_TARGET_ACTIONS.includes(ix.action) && (
        <InteractionRow label={t("card.to")}>
          <SelectField
            label={t("card.to")}
            value={ix.to ?? ""}
            options={screens}
            placeholder={t("card.pickScreen")}
            onChange={(to) => onChange({ to })}
          />
        </InteractionRow>
      )}
      {ix.action === "link" && (
        <InteractionRow label={t("card.url")}>
          <CommitInput
            aria-label={t("card.url")}
            value={ix.url ?? ""}
            onCommit={(url) => {
              if (!isWebAddress(url)) return t("card.urlInvalid");
              onChange({ url });
            }}
          />
        </InteractionRow>
      )}
    </>
  );
}
