import { Sparkles } from "lucide-react";

import { toast } from "@shared/stores/toast-store";
import { Badge, Button } from "@shared/ui/kit";
import { contrastResults } from "../..";
import { fixAllTokens, fixToken, useColorWizardStore, useWizardTheme } from "../store";

/** Each readable pair's contrast per mode; a Fix moves the token to the nearest shade that passes. */
export function ContrastChecks() {
  const { theme } = useWizardTheme();
  const set = useColorWizardStore((s) => s.set);
  const results = contrastResults(theme);
  const failing = results.filter((r) => !r.pass).length;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="flex-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Contrast (WCAG)
        </span>
        {failing ? (
          <>
            <Badge variant="outline" className="text-destructive">
              {failing} low
            </Badge>
            <Button
              size="sm"
              onClick={() => {
                const fixed = fixAllTokens();
                toast({
                  title: fixed
                    ? `Fixed ${fixed} pairs`
                    : "No shade fixes these; try another base color",
                });
              }}
            >
              <Sparkles />
              Fix all
            </Button>
          </>
        ) : (
          <Badge variant="outline" className="text-success">
            All pass
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 lg:grid-cols-2">
        {results.map((r) => (
          <div key={`${r.label}-${r.mode}`} className="flex min-h-6.5 items-center gap-2 text-xs">
            <span
              className="grid h-5 w-8.5 shrink-0 place-items-center rounded-xs border border-border text-[11px] font-bold"
              style={{ background: r.bgHex, color: r.fgHex }}
            >
              Aa
            </span>
            <span className="flex-1">
              {r.label} · {r.mode}
            </span>
            <span className="text-muted-foreground">{r.ratio.toFixed(1)}:1</span>
            {r.pass ? (
              <Badge variant="outline" className="text-success">
                {r.min >= 4.5 ? (r.ratio >= 7 ? "AAA" : "AA") : "AA large"}
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="xs"
                title={`Move ${r.fix} to the nearest shade that passes`}
                onClick={() => {
                  if (fixToken(r.fix, r.mode))
                    set({ themeSelection: { name: r.fix, mode: r.mode } });
                  else
                    toast({
                      title: `No shade of ${r.fix} passes`,
                      description: "Try a lighter or darker base color.",
                    });
                }}
              >
                Fix
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
