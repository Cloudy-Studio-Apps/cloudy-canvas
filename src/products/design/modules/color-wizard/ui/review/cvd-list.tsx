import { Badge, Swatch } from "@shared/ui/kit";
import { cvdWarnings, simulateCvd } from "../..";
import { useWizardTheme } from "../store";

/** Roles that look alike, to everyone or with a color-vision deficiency. */
export function CvdList() {
  const { theme } = useWizardTheme();
  const warnings = cvdWarnings(theme);
  return (
    <div>
      <div className="mb-1.5 flex items-center">
        <span className="flex-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Color blindness
        </span>
        <Badge variant="outline" className={warnings.length ? "text-warning" : "text-success"}>
          {warnings.length ? `${warnings.length} close pairs` : "Roles stay apart"}
        </Badge>
      </div>
      {warnings.map((w) => (
        <div key={`${w.a}-${w.b}`} className="flex items-center gap-2 py-1 text-xs">
          <Swatch color={simulateCvd(w.aHex, w.kinds[0] ?? "none")} size="sm" />
          <Swatch color={simulateCvd(w.bHex, w.kinds[0] ?? "none")} size="sm" />
          <span className="flex-1">
            <b>{w.a}</b> and <b>{w.b}</b> look alike{" "}
            {w.everyone ? "to everyone" : `with ${w.kinds.join(", ")}`}
          </span>
          <span className="text-muted-foreground">
            {w.everyone ? "Change one of the roles" : "Pair them with an icon or a label"}
          </span>
        </div>
      ))}
    </div>
  );
}
