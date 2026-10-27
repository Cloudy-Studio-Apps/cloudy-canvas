import { Trash2 } from "lucide-react";

import { DEFAULT_VALUE, DOCUMENT_TOKENS } from "@canvas";
import { CommitInput, useDocumentTokens } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/kit";
import { AdvancedSettings } from "./advanced-settings";
import { ValueField } from "./value-field";
import type { VariableEditorProps } from "./variables-ui.types";
import { t } from "../variables.i18n";

/** The "Varies by" choice of no axis. */
const NONE = "none";

/**
 * A variable: its name (a slash path: changing the groups moves it), its value (one per mode once
 * the file has modes; a mode left alone uses the default) and a short description. Where it's
 * offered, its names in code and hiding it are under Advanced.
 */
export function VariableEditor({ variable, onDelete }: VariableEditorProps) {
  const engine = useDesignEngine();
  const tokens = engine.service(DOCUMENT_TOKENS);
  const { store } = useDocumentTokens();
  const axes = store.switchableAxes();
  // With one axis there's nothing to choose: its modes are the rows.
  const axis =
    (variable.axisId ? store.axis(variable.axisId) : undefined) ??
    (axes.length === 1 ? axes[0] : undefined);
  return (
    <div className="flex flex-col gap-3 text-xs">
      <CommitInput
        aria-label={t("editor.name")}
        value={variable.name}
        onCommit={(name) => tokens.updateVariable(variable.id, { name })}
        className="h-7 text-sm font-medium"
      />

      <div className="flex flex-col gap-1.5">
        {axes.length > 1 && (
          <Select
            value={variable.axisId ?? NONE}
            onValueChange={(id) => tokens.setVariableAxis(variable.id, id === NONE ? null : id)}
          >
            <SelectTrigger aria-label={t("editor.modes")} className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>{t("editor.sameInEvery")}</SelectItem>
              {axes.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {t("editor.changesWith", { name: a.name })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {axis ? (
          axis.modes.map((mode) => (
            <div key={mode.id} className="flex items-center gap-2">
              <span className="w-16 shrink-0 truncate text-muted-foreground" title={mode.name}>
                {mode.name}
              </span>
              <ValueField
                variable={variable}
                mode={mode.id}
                label={mode.name}
                className="min-w-0 flex-1"
              />
            </div>
          ))
        ) : (
          <ValueField variable={variable} mode={DEFAULT_VALUE} label={t("editor.value")} />
        )}
      </div>

      <CommitInput
        aria-label={t("editor.description")}
        placeholder={t("editor.addDescription")}
        value={variable.description}
        onCommit={(description) => tokens.updateVariable(variable.id, { description })}
        className="h-7 text-xs"
      />

      <AdvancedSettings variable={variable} />

      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="justify-start text-destructive"
      >
        <Trash2 /> {t("editor.delete")}
      </Button>
    </div>
  );
}
