import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { DOCUMENT_TOKENS, type TokenScope } from "@canvas";
import { CommitInput } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { cn } from "@shared/ui/lib/utils";
import { SCOPE_OPTIONS } from "./scope-options";
import type { AdvancedSettingsProps } from "./variables-ui.types";

const PLATFORM_HINTS = {
  web: "Web, e.g. var(--brand-500)",
  ios: "iOS, e.g. Color.brand500",
  android: "Android, e.g. R.color.brand_500",
} as const;

/**
 * A variable's rarely used settings, folded: which fields pickers offer it for, its names in code
 * and hiding it from pickers.
 */
export function AdvancedSettings({ variable }: AdvancedSettingsProps) {
  const engine = useDesignEngine();
  const tokens = engine.service(DOCUMENT_TOKENS);
  const [open, setOpen] = useState(false);
  const toggleScope = (scope: TokenScope) =>
    tokens.updateVariable(variable.id, {
      scopes: variable.scopes.includes(scope)
        ? variable.scopes.filter((s) => s !== scope)
        : [...variable.scopes, scope],
    });

  return (
    <div className="flex flex-col gap-2 text-xs">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
        Advanced
      </button>
      {open && (
        <div className="flex flex-col gap-3 pl-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">
              Show in pickers for {variable.scopes.length === 0 ? "every field" : "these fields"}
            </span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {SCOPE_OPTIONS[variable.type].map(({ scope, label }) => (
                <label key={scope} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={variable.scopes.includes(scope)}
                    onChange={() => toggleScope(scope)}
                    className="accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Name in code</span>
            {(["web", "ios", "android"] as const).map((platform) => (
              <CommitInput
                key={platform}
                aria-label={`${platform} code syntax`}
                placeholder={PLATFORM_HINTS[platform]}
                value={variable.codeSyntax[platform] ?? ""}
                onCommit={(text) =>
                  tokens.updateVariable(variable.id, {
                    codeSyntax: { ...variable.codeSyntax, [platform]: text.trim() || undefined },
                  })
                }
                className="h-7 text-xs"
              />
            ))}
          </div>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={variable.hidden}
              onChange={() => tokens.updateVariable(variable.id, { hidden: !variable.hidden })}
              className="accent-primary"
            />
            Hide from pickers and the design system
          </label>
        </div>
      )}
    </div>
  );
}
