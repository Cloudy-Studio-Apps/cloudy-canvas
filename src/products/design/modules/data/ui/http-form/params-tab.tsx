import { t } from "../../data.i18n";
import type { ConnectionTabProps } from "./connection-tab.types";
import { PairEditor } from "./pair-editor";
import { withParams } from "./url-parts";

/** The link's settings after `?` as rows; editing them rewrites the link. */
export function ParamsTab({ draft, onChange }: ConnectionTabProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs text-muted-foreground">{t("connection.params.intro")}</p>
      <PairEditor
        rows={draft.params}
        nameLabel={t("connection.params.name")}
        addPlaceholder={t("connection.params.add")}
        onChange={(params) => onChange({ ...draft, params, url: withParams(draft.url, params) })}
      />
    </div>
  );
}
