import { Badge, Swatch } from "@shared/ui/kit";
import { useWizardPlan } from "../store";

/** Every variable and text style Create writes; with a system, which are new and which update. */
export function PlannedVariables() {
  const plan = useWizardPlan();
  const updating = plan.updated > 0;
  return (
    <div className="flex flex-col gap-3.5">
      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {updating ? "Variables to create and update" : "Variables to create"}
      </span>
      {plan.collections.map((c) => (
        <div key={c.name}>
          <h3 className="mb-1.5 flex justify-between gap-2 text-[13px] font-semibold">
            {c.name}
            <span className="text-xs font-normal text-muted-foreground">
              {c.variables.length} · {c.modes.join(", ")}
            </span>
          </h3>
          {c.variables.map((v) => (
            <div key={v.name} className="flex items-center gap-2 py-0.5 text-xs">
              <Swatch color={v.hexes[0] ?? "transparent"} size="sm" />
              <span className="flex-1 truncate">{v.name}</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {c.modes.length > 1 ? v.aliases.join(" · ") : v.hexes[0]}
              </span>
              {updating && (
                <Badge
                  variant="outline"
                  className={v.action === "update" ? "text-warning" : "text-success"}
                >
                  {v.action}
                </Badge>
              )}
            </div>
          ))}
        </div>
      ))}
      {plan.textStyles.length > 0 && (
        <div>
          <h3 className="mb-1.5 flex justify-between text-[13px] font-semibold">
            Text styles
            <span className="text-xs font-normal text-muted-foreground">
              {plan.textStyles.length}
            </span>
          </h3>
          {plan.textStyles.map((s) => (
            <div key={s.name} className="flex justify-between py-0.5 text-xs">
              <span>Type/{s.name}</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {s.font} {s.size}
              </span>
            </div>
          ))}
        </div>
      )}
      {plan.bindings > 0 && (
        <p className="rounded-lg border border-border bg-surface-sunken p-2.5 text-xs text-muted-foreground">
          Also binds {plan.bindings} paints of the collected layers to the new variables.
        </p>
      )}
    </div>
  );
}
