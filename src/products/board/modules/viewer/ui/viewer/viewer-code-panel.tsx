import { useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";

import { Button, IconButton } from "@shared/ui/kit";
import { t } from "../../viewer.i18n";
import type { ViewerCodePanelProps } from "./viewer-code-panel.types";

/** How long "Copied" shows after copying. */
const COPIED_MS = 1500;

/** A part's side panel showing code, read-only: its title, All code, Copy and close. */
export function ViewerCodePanel({ title, code, onAll, onClose }: ViewerCodePanelProps) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    void navigator.clipboard.writeText(code).then(() => setCopied(true));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
        {onAll && (
          <Button variant="ghost" size="sm" onClick={onAll}>
            {t("panel.all")}
          </Button>
        )}
        <IconButton label={copied ? t("panel.copied") : t("panel.copy")} size="sm" onClick={copy}>
          {copied ? <Check /> : <Copy />}
        </IconButton>
        <IconButton label={t("panel.close")} size="sm" onClick={onClose}>
          <X />
        </IconButton>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto bg-muted/40 p-3 font-mono text-xs leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
