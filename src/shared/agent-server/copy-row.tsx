import { Copy } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import { cn } from "@shared/ui/lib/utils";
import { copyText } from "./copy-agent-setup";
import type { CopyRowProps } from "./copy-row.types";
import { t } from "./agent-server.i18n";

/** A labeled value in monospace with a Copy button. */
export function CopyRow({ label, value, hint, disabled = false }: CopyRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => copyText(value, t("copy.copied", { label }), hint)}
        >
          <Copy />
          {t("copy.copy")}
        </Button>
      </div>
      <pre
        className={cn(
          "overflow-x-auto rounded-md border bg-surface-sunken px-2.5 py-2 font-mono text-xs whitespace-pre text-muted-foreground",
          disabled && "opacity-50",
        )}
      >
        {value}
      </pre>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
