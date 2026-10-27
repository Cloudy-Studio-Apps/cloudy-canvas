import { Badge, Swatch } from "@shared/ui/kit";
import { cvdWarnings, simulateCvd } from "../..";
import { useWizardTheme } from "../store";
import { t } from "../../color-wizard.i18n";

/** Roles that look alike, to everyone or with a color-vision deficiency. */
export function CvdList() {
  const { theme } = useWizardTheme();
  const warnings = cvdWarnings(theme);
  return (
    <div>
      <div className="mb-1.5 flex items-center">
        <span className="flex-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {t("review.cvd.title")}
        </span>
        <Badge variant="outline" className={warnings.length ? "text-warning" : "text-success"}>
          {warnings.length
            ? t("review.cvd.close", { count: warnings.length })
            : t("review.cvd.apart")}
        </Badge>
      </div>
      {warnings.map((w) => (
        <div key={`${w.a}-${w.b}`} className="flex items-center gap-2 py-1 text-xs">
          <Swatch color={simulateCvd(w.aHex, w.kinds[0] ?? "none")} size="sm" />
          <Swatch color={simulateCvd(w.bHex, w.kinds[0] ?? "none")} size="sm" />
          <span className="flex-1">
            {t("review.cvd.lookAlike", { a: w.a, b: w.b })}{" "}
            {w.everyone
              ? t("review.cvd.everyone")
              : t("review.cvd.with", { kinds: w.kinds.join(", ") })}
          </span>
          <span className="text-muted-foreground">
            {w.everyone ? t("review.cvd.change") : t("review.cvd.pair")}
          </span>
        </div>
      ))}
    </div>
  );
}
