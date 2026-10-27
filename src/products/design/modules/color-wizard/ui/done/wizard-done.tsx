import { Check } from "lucide-react";
import { useMemo } from "react";

import { getLocale } from "@shared/core";
import { CelebratingSeal } from "@shared/ui/brand/celebrating-seal";
import { cn } from "@shared/ui/kit";
import { buildTheme, contrastResults, MODE_SETS, wizardColors } from "../..";
import { useColorWizardStore, useWizardInput } from "../store";
import { DoneStat } from "./done-stat";
import type { WizardDoneProps } from "./done.types";
import { t } from "../../color-wizard.i18n";

/** After Create: the seal celebrating, the palette made, what's in it and how readable it is. */
export function WizardDone({ result }: WizardDoneProps) {
  const input = useWizardInput();
  const options = useColorWizardStore((s) => s.options);
  const type = useColorWizardStore((s) => s.type);
  const colors = useMemo(() => wizardColors(input.roles, input.options), [input]);
  const low = useMemo(
    () =>
      contrastResults(buildTheme(colors, input.options, input.overrides)).filter((r) => !r.pass)
        .length,
    [colors, input],
  );
  const made = [
    result.created > 0 && t("done.created", { count: result.created }),
    result.updated > 0 && t("done.updated", { count: result.updated }),
    result.textStyles > 0 && t("done.textStyles", { count: result.textStyles }),
  ].filter(Boolean);
  const summary =
    made.length > 0
      ? new Intl.ListFormat(getLocale(), { style: "long", type: "conjunction" }).format(
          made as string[],
        )
      : undefined;
  const collections = 1 + (options.theme ? 1 : 0) + (result.textStyles ? 1 : 0);
  return (
    <div className="flex h-full items-center justify-center overflow-auto p-6">
      <div className="w-full max-w-2xl text-center">
        <CelebratingSeal size={132} className="mx-auto mb-1" />
        <h2 className="mb-1.5 animate-in text-xl font-semibold tracking-tight fade-in-0 slide-in-from-bottom-2">
          {t("done.ready")}
        </h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          <b className="text-foreground">{result.collection}</b>{" "}
          {t("done.nowHas", { summary: summary ?? t("done.itsColors") })}
          {result.bound > 0 && ` ${t("done.bound", { count: result.bound })}`}{" "}
          {t("done.styleGuide")}
        </p>
        <div className="mx-auto mt-4 flex h-11 max-w-md overflow-hidden rounded-lg border border-border">
          {colors.map((c) => (
            <div
              key={c.name}
              className="flex-1"
              style={{ background: c.hex }}
              title={`${c.name} ${c.hex}`}
            />
          ))}
        </div>
        <div className="mx-auto mt-3.5 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
          <DoneStat value={result.created + result.updated} label={t("done.variables")} />
          <DoneStat value={collections} label={t("done.collections", { count: collections })} />
          <DoneStat
            value={options.theme ? MODE_SETS[options.modes].join(" & ") : "—"}
            label={t("done.themeModes")}
          />
          <DoneStat
            value={result.textStyles || "—"}
            label={
              type.enabled
                ? t("done.stylesWithFont", { font: type.heading })
                : t("done.stylesLabel")
            }
          />
        </div>
        <div
          className={cn(
            "mt-3.5 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
            low ? "bg-warning-soft text-warning" : "bg-success-soft text-success",
          )}
        >
          {low ? (
            t("done.lowContrast", { count: low })
          ) : (
            <>
              <Check className="size-3.5" />
              {t("done.allPass")}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
