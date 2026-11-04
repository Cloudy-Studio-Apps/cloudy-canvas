import { SelectField } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import type { PageMasterFieldProps } from "./sidebar.types";
import { t } from "../../catalog.i18n";

/** The choice for a page that uses the brochure's default master. */
const DEFAULT = "default";
/** The choice for a page with no master (a full-bleed photo). */
const NONE = "none";

/** The master the pages show (`slotIds`, all set at once): the default, one of them or none. */
export function PageMasterField({ slotIds }: PageMasterFieldProps) {
  const { brochure, masters, settings } = useBrochure();
  if (!brochure) return null;
  if (masters.length === 0) {
    return <p className="text-xs text-muted-foreground">{t("pageMaster.noMasters")}</p>;
  }
  const ids = new Set(slotIds);
  const values = new Set(
    (brochure.record()?.slots ?? [])
      .filter((slot) => ids.has(slot.id))
      .map((slot) => (slot.master === undefined ? DEFAULT : (slot.master ?? NONE))),
  );
  const fallback = masters.find((master) => master.id === settings.defaultMaster);
  const options = [
    {
      value: DEFAULT,
      label: fallback
        ? t("pageMaster.default", { name: fallback.name })
        : t("pageMaster.defaultNone"),
    },
    ...masters.map((master) => ({ value: master.id, label: master.name })),
    { value: NONE, label: t("pageMaster.none") },
  ];

  return (
    <SelectField
      label={t("pageMaster.label")}
      layout="inline"
      value={values.size === 1 ? ([...values][0] ?? DEFAULT) : ""}
      placeholder={t("pageMaster.mixed")}
      options={options}
      onChange={(value) =>
        brochure.masters.setPageMaster(
          slotIds,
          value === DEFAULT ? undefined : value === NONE ? null : value,
        )
      }
    />
  );
}
