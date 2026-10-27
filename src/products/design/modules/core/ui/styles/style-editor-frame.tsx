import { Trash2 } from "lucide-react";

import { DOCUMENT_TOKENS } from "@canvas";
import { CommitInput, CommitTextarea } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { Button, Field } from "@shared/ui/kit";
import { UsageSummary } from "@design/ui/components/token-usage";
import type { StyleEditorFrameProps } from "./styles.types";
import { t } from "../../core.i18n";

/** What every style's editor has: its name, its own controls, a description, its usage and Delete. */
export function StyleEditorFrame({ style, onDelete, children }: StyleEditorFrameProps) {
  const engine = useDesignEngine();
  const tokens = engine.service(DOCUMENT_TOKENS);
  return (
    <div className="flex flex-col gap-3 text-xs">
      <Field label={t("styles.name")}>
        {(id) => (
          <CommitInput
            id={id}
            value={style.name}
            onCommit={(name) => tokens.updateStyle(style.id, { name })}
            className="h-7 text-xs"
          />
        )}
      </Field>
      {children}
      <Field label={t("styles.description")}>
        {(id) => (
          <CommitTextarea
            id={id}
            value={style.description}
            onCommit={(description) => tokens.updateStyle(style.id, { description })}
            className="min-h-12 text-xs"
          />
        )}
      </Field>
      <Field label={t("styles.usage")}>
        <UsageSummary id={style.id} />
      </Field>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="justify-start text-destructive"
      >
        <Trash2 /> {t("styles.delete")}
      </Button>
    </div>
  );
}
