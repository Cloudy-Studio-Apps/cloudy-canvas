import { useState } from "react";

import { SelectField } from "@shared/ui/kit";
import { dataCopyTag, repeatOf, templateOf } from "../../repeat";
import { RepeatSettingsBlock } from "./repeat-settings";
import { RepeatStart } from "./repeat-start";
import { SettingRow } from "./setting-row";
import { useSetRepeat } from "./use-set-repeat";
import type { ContainerRepeatProps } from "./container-repeat.types";
import { t } from "../../data.i18n";

/**
 * A frame's repeat: the card it repeats (one of its own layers; changing it while on switches
 * the copies to the new card), then "Repeat for each row" or the repeat's settings. A copied
 * iterator says to edit its template's repeat instead.
 */
export function ContainerRepeat({ frame, layers }: ContainerRepeatProps) {
  const apply = useSetRepeat(frame.id);
  const [picked, setPicked] = useState<string | null>(null);
  const repeat = repeatOf(frame);
  if (dataCopyTag(frame)) {
    return <p className="text-xs text-muted-foreground">{t("repeat.copied")}</p>;
  }
  const own = layers.filter((child) => dataCopyTag(child)?.iterator !== frame.id);
  const current = repeat ? templateOf(frame, layers) : null;
  const cardId =
    current?.id ?? (own.some((child) => child.id === picked) ? picked : own[0]?.id) ?? undefined;

  return (
    <div className="flex flex-col gap-3">
      {cardId !== undefined && (
        <SettingRow label={t("repeat.card.label")}>
          <SelectField
            label={t("repeat.card.label")}
            value={cardId}
            options={own.map((child) => ({ value: child.id, label: child.name }))}
            onChange={(id) => (repeat ? apply({ template: id }) : setPicked(id))}
            className="min-w-0 flex-1"
          />
        </SettingRow>
      )}
      {repeat ? (
        <RepeatSettingsBlock frameId={frame.id} repeat={repeat} apply={apply} />
      ) : (
        <RepeatStart frameId={frame.id} cardId={cardId} apply={apply} />
      )}
    </div>
  );
}
