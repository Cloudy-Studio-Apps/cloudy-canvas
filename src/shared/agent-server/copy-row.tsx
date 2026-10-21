import { Copy } from "lucide-react";

import { clipboard } from "@platform";
import { notifyError, toast } from "@shared/stores/toast-store";
import { Button } from "@shared/ui/components/ui/button";
import { cn } from "@shared/ui/lib/utils";
import type { CopyRowProps } from "./copy-row.types";

/** A labeled value in monospace with a Copy button. */
export function CopyRow({ label, value, disabled = false }: CopyRowProps) {
  const copy = () =>
    void clipboard.writeText(value).then(
      () => toast({ title: `${label} copied` }),
      (error: unknown) => notifyError("Couldn't copy to the clipboard", error),
    );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <Button variant="ghost" size="sm" disabled={disabled} onClick={copy}>
          <Copy />
          Copy
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
    </div>
  );
}
