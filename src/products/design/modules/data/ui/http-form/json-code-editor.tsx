import { Sparkles } from "lucide-react";

import { Badge, Button, Textarea, cn } from "@shared/ui/kit";
import { t } from "../../data.i18n";
import { jsonProblem, tidyJson } from "./json-body";
import type { JsonCodeEditorProps } from "./json-code-editor.types";

/** JSON written by hand, checked as it's typed (which line is wrong), with Tidy up. */
export function JsonCodeEditor({ value, onChange }: JsonCodeEditorProps) {
  const problem = jsonProblem(value);
  return (
    <div className="flex flex-col gap-1.5">
      <Textarea
        aria-label={t("sources.http.body")}
        value={value}
        spellCheck={false}
        aria-invalid={problem !== null}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Tab" || event.shiftKey) return;
          event.preventDefault();
          const el = event.currentTarget;
          el.setRangeText("  ", el.selectionStart, el.selectionEnd, "end");
          onChange(el.value);
        }}
        className={cn(
          "min-h-44 font-mono text-xs leading-relaxed",
          problem && "border-destructive",
        )}
      />
      <div className="flex items-center gap-2">
        {problem ? (
          <Badge variant="destructive">
            {problem.line
              ? t("connection.body.jsonLine", { line: problem.line })
              : t("connection.body.jsonInvalid")}
          </Badge>
        ) : (
          <Badge variant="secondary">{t("connection.body.jsonValid")}</Badge>
        )}
        <Button
          size="xs"
          variant="ghost"
          className="ml-auto"
          disabled={problem !== null}
          onClick={() => onChange(tidyJson(value))}
        >
          <Sparkles />
          {t("connection.body.tidy")}
        </Button>
      </div>
    </div>
  );
}
