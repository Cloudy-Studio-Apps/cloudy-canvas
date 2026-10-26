import { Check } from "lucide-react";
import { useMemo } from "react";

import { CelebratingSeal } from "@shared/ui/brand/celebrating-seal";
import { cn } from "@shared/ui/kit";
import { buildTheme, contrastResults, MODE_SETS, wizardColors } from "../..";
import { useColorWizardStore, useWizardInput } from "../store";
import { DoneStat } from "./done-stat";
import type { WizardDoneProps } from "./done.types";

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
    result.created > 0 && `${result.created} color variables`,
    result.updated > 0 && `${result.updated} updated`,
    result.textStyles > 0 && `${result.textStyles} text styles`,
  ].filter(Boolean);
  const summary = made.length > 1 ? `${made.slice(0, -1).join(", ")} and ${made.at(-1)}` : made[0];
  const collections = 1 + (options.theme ? 1 : 0) + (result.textStyles ? 1 : 0);
  return (
    <div className="flex h-full items-center justify-center overflow-auto p-6">
      <div className="w-full max-w-2xl text-center">
        <CelebratingSeal size={132} className="mx-auto mb-1" />
        <h2 className="mb-1.5 animate-in text-xl font-semibold tracking-tight fade-in-0 slide-in-from-bottom-2">
          Your design system is ready!
        </h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          <b className="text-foreground">{result.collection}</b> now has {summary ?? "its colors"}.
          {result.bound > 0 && ` ${result.bound} layers now use them.`} The style guide is laid out
          and stays up to date as you edit them.
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
          <DoneStat value={result.created + result.updated} label="variables" />
          <DoneStat value={collections} label={collections === 1 ? "collection" : "collections"} />
          <DoneStat
            value={options.theme ? MODE_SETS[options.modes].join(" & ") : "—"}
            label="theme modes"
          />
          <DoneStat
            value={result.textStyles || "—"}
            label={type.enabled ? `text styles · ${type.heading}` : "text styles"}
          />
        </div>
        <div
          className={cn(
            "mt-3.5 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
            low ? "bg-warning-soft text-warning" : "bg-success-soft text-success",
          )}
        >
          {low ? (
            `${low} contrast pairs are below AA. You can fix them any time from the Theme.`
          ) : (
            <>
              <Check className="size-3.5" />
              Every contrast check passes
            </>
          )}
        </div>
      </div>
    </div>
  );
}
