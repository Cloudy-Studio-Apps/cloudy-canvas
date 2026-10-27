import type { ErrorCodeBlockProps } from "./error-code-block.types";
import { t } from "./error.i18n";

/** The error's code and what to do with it, in place of the stack in production builds. */
export function ErrorCodeBlock({ code }: ErrorCodeBlockProps) {
  return (
    <div className="grid justify-items-center gap-2">
      <div className="inline-flex items-center gap-2.5 rounded-md border border-dashed px-3 py-1.5 text-xs text-muted-foreground">
        {t("code.label")}
        <code className="font-mono text-sm tracking-wider text-foreground select-all">{code}</code>
      </div>
      <p className="text-xs text-muted-foreground">{t("code.hint")}</p>
    </div>
  );
}
