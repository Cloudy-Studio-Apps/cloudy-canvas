import { ExternalLink } from "lucide-react";

import { erStandards } from "../../../base/standards/er-standard-registry";
import { openExternal } from "@platform";
import { Button } from "@shared/ui/kit";
import { notifyError } from "@shared/stores/toast-store";
import { ShapeSelect } from "../forms/shape-select";
import type { ErStandardPickerProps } from "./diagram-settings.types";
import { t } from "../../../er.i18n";

/**
 * Which standard (textbook or paper) the diagram follows: it draws in its notation and the Check
 * diagram reports what it doesn't have. Shows where it comes from, with a link to read it.
 */
export function ErStandardPicker({ standard, onPick }: ErStandardPickerProps) {
  const info = erStandards.resolve(standard);
  const installed = erStandards.list();
  const missing = !installed.some((s) => s.id === standard);
  return (
    <div className="space-y-1.5">
      <ShapeSelect
        aria-label={t("standard.label")}
        value={standard}
        options={[
          ...installed.map((s) => ({ value: s.id, label: s.label })),
          ...(missing
            ? [{ value: standard, label: t("standard.notInstalled", { id: standard }) }]
            : []),
        ]}
        className="w-full"
        onChange={onPick}
      />
      <div className="space-y-1 rounded-md border border-border bg-surface-sunken p-2 text-xs">
        {missing && <p className="text-muted-foreground">{t("standard.missing")}</p>}
        <p>{info.summary}</p>
        <p className="text-muted-foreground">{info.citation}</p>
        {info.approximate && <p className="text-muted-foreground">{t("standard.approximate")}</p>}
        {info.url && (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-7"
            onClick={() =>
              void openExternal(info.url ?? "").catch((error: unknown) =>
                notifyError(t("standard.openFailed"), error),
              )
            }
          >
            <ExternalLink />
            {t("standard.open")}
          </Button>
        )}
      </div>
    </div>
  );
}
