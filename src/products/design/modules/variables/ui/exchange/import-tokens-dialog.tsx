import { useMemo, useState } from "react";

import { DOCUMENT_TOKENS, importConflicts, selectTokens, type ImportChoice } from "@canvas";
import { ImportConflicts, useEditorModules } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { designStyleTypes } from "../../../core/ui";
import { notifyError, toast } from "@shared/stores/toast-store";
import { tCommon } from "@shared/core";
import { AppDialog, Button } from "@shared/ui/kit";

import type { ImportBodyProps, ImportTokensDialogProps } from "./exchange.types";
import { ImportPickTree } from "./import-pick-tree";
import { allKeys, pickOf, pickRows } from "./pick-rows";
import { t } from "../../variables.i18n";

/**
 * Importing a picked file's variables and styles: tick collections, style types or their groups
 * (what they alias comes along), choose what to do with ones named like the file's, and import
 * in one undo step. Ids are kept, so importing the same file again updates them.
 */
export function ImportTokensDialog({ source, onClose }: ImportTokensDialogProps) {
  return source ? <ImportBody key={source.name} source={source} onClose={onClose} /> : null;
}

function ImportBody({ source, onClose }: ImportBodyProps) {
  const engine = useDesignEngine();
  const { host } = useEditorModules();
  const tokens = engine.service(DOCUMENT_TOKENS);
  const rows = useMemo(
    () =>
      pickRows(
        source.records,
        (type) => host.find(designStyleTypes, type)?.heading ?? t("import.styles", { type }),
      ),
    [source, host],
  );
  const [ticked, setTicked] = useState(() => allKeys(rows));
  const [choice, setChoice] = useState<ImportChoice>("replace");
  const selected = useMemo(
    () => selectTokens(source.records, pickOf(source.records, ticked)),
    [source, ticked],
  );
  const conflicts = useMemo(
    () => importConflicts(tokens.store(), selected.records),
    [tokens, selected],
  );
  const count = selected.records.filter((r) => r.kind === "variable" || r.kind === "style").length;

  const run = () => {
    try {
      const plan = tokens.importTokens(selected.records, choice);
      const parts = [
        plan.added > 0 && t("import.added", { count: plan.added }),
        plan.updated > 0 && t("import.updated", { count: plan.updated }),
        plan.skipped > 0 && t("import.skipped", { count: plan.skipped }),
      ].filter(Boolean);
      toast({
        title: t("import.done"),
        description: parts.join(", ") || t("import.nothing"),
      });
      onClose();
    } catch (error) {
      notifyError(t("import.error"), error);
    }
  };

  return (
    <AppDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t("import.title")}
      description={`${source.name} · ${source.label}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={run} disabled={count === 0}>
            {t("import.action", { count })}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("import.empty")}</p>
        ) : (
          <ImportPickTree rows={rows} ticked={ticked} onChange={setTicked} />
        )}
        {selected.extra > 0 && (
          <p className="text-xs text-muted-foreground">
            {t("import.extra", { count: selected.extra })}
          </p>
        )}
        <ImportConflicts
          names={conflicts.map((c) => c.name)}
          choice={choice}
          onChoice={setChoice}
        />
        {source.warnings.length > 0 && (
          <ul className="list-disc pl-4 text-xs text-muted-foreground">
            {source.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
      </div>
    </AppDialog>
  );
}
